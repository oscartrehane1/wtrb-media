import type { EnquiryInput } from "./types.ts";

type DeliveryConfig = { apiKey: string; from: string; to: string };
type Fetcher = typeof fetch;

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export function createEnquiryEmail(data: EnquiryInput) {
  const rows = [
    ["Name", data.name],
    ["Company / organisation", data.company || "Not provided"],
    ["Email", data.email],
    ["Project type", data.projectType],
    ["Shoot location", data.location || "Not provided"],
    ["Preferred timeframe", data.timeframe || "Not provided"],
    ["Indicative budget", data.budget],
  ];

  const htmlRows = rows.map(([label, value]) => `<tr><th align="left" style="padding:8px 16px 8px 0;vertical-align:top">${escapeHtml(label)}</th><td style="padding:8px 0">${escapeHtml(value)}</td></tr>`).join("");

  return {
    subject: `New project enquiry — ${data.projectType}`,
    html: `<div style="font-family:Arial,sans-serif;color:#101312;line-height:1.5"><h1 style="font-size:24px">New WtRB Media enquiry</h1><table style="border-collapse:collapse">${htmlRows}</table><h2 style="font-size:18px;margin-top:24px">Project description</h2><p style="white-space:pre-wrap">${escapeHtml(data.description)}</p></div>`,
    text: `${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nProject description:\n${data.description}`,
  };
}

export async function sendEnquiry(data: EnquiryInput, config: DeliveryConfig, fetcher: Fetcher = fetch) {
  const email = createEnquiryEmail(data);
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      reply_to: data.email,
      ...email,
    }),
  });
  return response.ok;
}
