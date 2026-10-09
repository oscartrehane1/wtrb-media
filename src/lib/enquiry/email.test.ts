import assert from "node:assert/strict";
import test from "node:test";
import { createEnquiryEmail, sendEnquiry } from "./email.ts";
import type { EnquiryInput } from "./types.ts";

const enquiry: EnquiryInput = {
  name: "Alex <script>",
  company: "Example Outdoors",
  email: "alex@example.com",
  projectType: "Film & photography",
  location: "North Wales",
  timeframe: "Spring",
  budget: "£3,000–£5,000",
  description: "A project with <strong>untrusted text</strong>.",
  privacy: true,
  website: "",
};

test("escapes customer content in the HTML notification", () => {
  const message = createEnquiryEmail(enquiry);
  assert.doesNotMatch(message.html, /<script>/);
  assert.doesNotMatch(message.html, /<strong>untrusted/);
  assert.match(message.html, /North Wales/);
  assert.match(message.text, /Spring/);
});

test("reports success only when the provider accepts delivery", async () => {
  let requestBody = "";
  const acceptedFetch = (async (_input: URL | RequestInfo, init?: RequestInit) => {
    requestBody = String(init?.body);
    return new Response(JSON.stringify({ id: "mock-id" }), { status: 200 });
  }) as typeof fetch;
  const rejectedFetch = (async () => new Response("rejected", { status: 422 })) as typeof fetch;
  const config = { apiKey: "test-key", from: "website@example.com", to: "hello@example.com" };

  assert.equal(await sendEnquiry(enquiry, config, acceptedFetch), true);
  assert.equal(await sendEnquiry(enquiry, config, rejectedFetch), false);
  assert.equal(JSON.parse(requestBody).reply_to, enquiry.email);
});
