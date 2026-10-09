import assert from "node:assert/strict";
import test from "node:test";
import { parseEnquiry } from "./validation.ts";

const validInput = {
  name: "Alex Morgan",
  company: "Example Outdoors",
  email: "alex@example.com",
  projectType: "Film production",
  location: "TBC",
  timeframe: "Flexible",
  budget: "Prefer to discuss",
  description: "A factual description of a potential outdoor film project.",
  privacy: true,
  website: "",
};

test("accepts and normalises a valid enquiry", () => {
  const result = parseEnquiry({ ...validInput, email: " ALEX@EXAMPLE.COM " });
  assert.equal(result.valid, true);
  assert.equal(result.data.email, "alex@example.com");
  assert.deepEqual(result.errors, {});
});

test("rejects missing required fields and invalid options", () => {
  const result = parseEnquiry({ projectType: "Post-production", budget: "Free", privacy: false });
  assert.equal(result.valid, false);
  assert.equal(result.data.projectType, "");
  assert.equal(result.data.budget, "Prefer to discuss");
  assert.ok(result.errors.name);
  assert.ok(result.errors.email);
  assert.ok(result.errors.projectType);
  assert.ok(result.errors.description);
  assert.ok(result.errors.privacy);
});

test("enforces project description length", () => {
  const result = parseEnquiry({ ...validInput, description: "x".repeat(5001) });
  assert.equal(result.valid, false);
  assert.match(result.errors.description ?? "", /5000/);
});
