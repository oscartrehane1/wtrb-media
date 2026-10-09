import { NextResponse } from "next/server";
import { sendEnquiry } from "@/lib/enquiry/email";
import { checkRateLimit } from "@/lib/enquiry/rate-limit";
import { parseEnquiry } from "@/lib/enquiry/validation";

export const runtime = "nodejs";

const maxRequestBytes = 16_384;

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Invalid request." }, { status: 403 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxRequestBytes) return NextResponse.json({ message: "Request too large." }, { status: 413 });

  let input: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > maxRequestBytes) return NextResponse.json({ message: "Request too large." }, { status: 413 });
    input = JSON.parse(body);
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const { data, errors, valid } = parseEnquiry(input);
  if (data.website) return NextResponse.json({ ok: true });
  if (!valid) return NextResponse.json({ message: "Check the highlighted fields.", errors }, { status: 422 });

  const forwardedFor = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const identifier = forwardedFor.split(",")[0]?.trim() || "unknown";
  const limit = await checkRateLimit(identifier);
  if (!limit.allowed) return NextResponse.json({ message: "Unable to send this enquiry right now." }, { status: 429 });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) return NextResponse.json({ message: "Email delivery is not configured." }, { status: 503 });

  try {
    const accepted = await sendEnquiry(data, { apiKey, to, from });
    if (!accepted) return NextResponse.json({ message: "Unable to send this enquiry." }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to send this enquiry." }, { status: 502 });
  }
}
