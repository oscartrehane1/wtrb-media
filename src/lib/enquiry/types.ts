export const projectTypes = [
  "Film production",
  "Photography",
  "Film & photography",
  "Something else",
] as const;

export const budgetOptions = [
  "Prefer to discuss",
  "Under £1,000",
  "£1,000–£3,000",
  "£3,000–£5,000",
  "£5,000–£10,000",
  "£10,000+",
] as const;

export type ProjectType = (typeof projectTypes)[number];
export type BudgetOption = (typeof budgetOptions)[number];

export type EnquiryInput = {
  name: string;
  company: string;
  email: string;
  projectType: ProjectType | "";
  location: string;
  timeframe: string;
  budget: BudgetOption;
  description: string;
  privacy: boolean;
  website: string;
};

export type EnquiryField = keyof EnquiryInput;
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;
