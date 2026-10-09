import { budgetOptions, projectTypes, type EnquiryErrors, type EnquiryInput } from "./types.ts";

export const enquiryLimits = {
  name: 100,
  company: 150,
  email: 254,
  location: 200,
  timeframe: 120,
  description: 5000,
  website: 200,
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseEnquiry(value: unknown): { data: EnquiryInput; errors: EnquiryErrors; valid: boolean } {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const data: EnquiryInput = {
    name: text(input.name),
    company: text(input.company),
    email: text(input.email).toLowerCase(),
    projectType: projectTypes.includes(input.projectType as (typeof projectTypes)[number]) ? input.projectType as (typeof projectTypes)[number] : "",
    location: text(input.location),
    timeframe: text(input.timeframe),
    budget: budgetOptions.includes(input.budget as EnquiryInput["budget"]) ? input.budget as EnquiryInput["budget"] : "Prefer to discuss",
    description: text(input.description),
    privacy: input.privacy === true,
    website: text(input.website),
  };
  const errors: EnquiryErrors = {};

  if (!data.name) errors.name = "Enter your name.";
  else if (data.name.length > enquiryLimits.name) errors.name = `Use ${enquiryLimits.name} characters or fewer.`;

  if (data.company.length > enquiryLimits.company) errors.company = `Use ${enquiryLimits.company} characters or fewer.`;

  if (!data.email) errors.email = "Enter your email address.";
  else if (data.email.length > enquiryLimits.email || !emailPattern.test(data.email)) errors.email = "Enter a valid email address.";

  if (!data.projectType) errors.projectType = "Choose a project type.";
  if (data.location.length > enquiryLimits.location) errors.location = `Use ${enquiryLimits.location} characters or fewer.`;
  if (data.timeframe.length > enquiryLimits.timeframe) errors.timeframe = `Use ${enquiryLimits.timeframe} characters or fewer.`;

  if (!data.description) errors.description = "Tell us a little about your project.";
  else if (data.description.length > enquiryLimits.description) errors.description = `Use ${enquiryLimits.description} characters or fewer.`;

  if (!data.privacy) errors.privacy = "Please acknowledge the privacy policy.";
  if (data.website.length > enquiryLimits.website) errors.website = "Invalid submission.";

  return { data, errors, valid: Object.keys(errors).length === 0 };
}
