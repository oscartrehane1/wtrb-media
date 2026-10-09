"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { budgetOptions, projectTypes, type EnquiryErrors, type EnquiryInput } from "@/lib/enquiry/types";
import { enquiryLimits, parseEnquiry } from "@/lib/enquiry/validation";

const initialValues: EnquiryInput = {
  name: "",
  company: "",
  email: "",
  projectType: "",
  location: "",
  timeframe: "",
  budget: "Prefer to discuss",
  description: "",
  privacy: false,
  website: "",
};

type Status = "idle" | "invalid" | "submitting" | "success" | "error";

export function EnquiryForm() {
  const [values, setValues] = useState<EnquiryInput>(initialValues);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const update = <Key extends keyof EnquiryInput>(key: Key, value: EnquiryInput[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
    if (status === "error" || status === "invalid") setStatus("idle");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const validation = parseEnquiry(values);
    if (!validation.valid) {
      setErrors(validation.errors);
      setStatus("invalid");
      const firstError = Object.keys(validation.errors)[0];
      requestAnimationFrame(() => {
        const target = document.getElementById(`enquiry-${firstError}`) ?? document.querySelector<HTMLElement>(`[name="${firstError}"]`);
        target?.focus();
      });
      return;
    }

    setStatus("submitting");
    setErrors({});
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      const result = await response.json() as { errors?: EnquiryErrors };
      if (!response.ok) {
        setErrors(result.errors ?? {});
        setStatus("error");
        return;
      }
      setValues(initialValues);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const fieldError = (field: keyof EnquiryInput) => errors[field] ? <span id={`enquiry-${field}-error`} className="field-error">{errors[field]}</span> : null;
  const describedBy = (field: keyof EnquiryInput, help?: string) => [help, errors[field] ? `enquiry-${field}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <form className="enquiry-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="enquiry-name">Your name <span aria-hidden="true">*</span></label>
          <input id="enquiry-name" name="name" type="text" autoComplete="name" required maxLength={enquiryLimits.name} value={values.name} onChange={(event) => update("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy("name")} />
          {fieldError("name")}
        </div>
        <div className="form-field">
          <label htmlFor="enquiry-company">Company / organisation <span>Optional</span></label>
          <input id="enquiry-company" name="company" type="text" autoComplete="organization" maxLength={enquiryLimits.company} value={values.company} onChange={(event) => update("company", event.target.value)} aria-invalid={Boolean(errors.company)} aria-describedby={describedBy("company")} />
          {fieldError("company")}
        </div>
        <div className="form-field">
          <label htmlFor="enquiry-email">Email address <span aria-hidden="true">*</span></label>
          <input id="enquiry-email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={enquiryLimits.email} value={values.email} onChange={(event) => update("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy("email")} />
          {fieldError("email")}
        </div>
        <fieldset className="form-field form-field--full form-options" aria-invalid={Boolean(errors.projectType)} aria-describedby={describedBy("projectType")}>
          <legend>Project type <span aria-hidden="true">*</span></legend>
          <div className="option-grid">
            {projectTypes.map((option) => (
              <label key={option}><input type="radio" name="projectType" value={option} required checked={values.projectType === option} onChange={() => update("projectType", option)} /><span>{option}</span></label>
            ))}
          </div>
          {fieldError("projectType")}
        </fieldset>
        <div className="form-field">
          <label htmlFor="enquiry-location">Shoot location <span>Optional</span></label>
          <input id="enquiry-location" name="location" type="text" maxLength={enquiryLimits.location} placeholder="e.g. Snowdonia, North Wales / Multiple locations" value={values.location} onChange={(event) => update("location", event.target.value)} aria-invalid={Boolean(errors.location)} aria-describedby={describedBy("location", "enquiry-location-help")} />
          <small id="enquiry-location-help">Not decided yet? Leave blank or write TBC.</small>
          {fieldError("location")}
        </div>
        <div className="form-field">
          <label htmlFor="enquiry-timeframe">Preferred timeframe <span>Optional</span></label>
          <input id="enquiry-timeframe" name="timeframe" type="text" maxLength={enquiryLimits.timeframe} placeholder="e.g. March 2027 / Flexible" value={values.timeframe} onChange={(event) => update("timeframe", event.target.value)} aria-invalid={Boolean(errors.timeframe)} aria-describedby={describedBy("timeframe")} />
          {fieldError("timeframe")}
        </div>
        <div className="form-field form-field--full">
          <label htmlFor="enquiry-budget">Indicative project budget <span>Optional</span></label>
          <div className="select-wrap">
            <select id="enquiry-budget" name="budget" value={values.budget} onChange={(event) => update("budget", event.target.value as EnquiryInput["budget"])}>
              {budgetOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
        </div>
        <div className="form-field form-field--full">
          <label htmlFor="enquiry-description">Tell us about your project <span aria-hidden="true">*</span></label>
          <textarea id="enquiry-description" name="description" rows={6} required maxLength={enquiryLimits.description} placeholder="What's the story, what do you need, and what are you hoping to achieve?" value={values.description} onChange={(event) => update("description", event.target.value)} aria-invalid={Boolean(errors.description)} aria-describedby={describedBy("description")} />
          {fieldError("description")}
        </div>
      </div>

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="enquiry-website">Website</label>
        <input id="enquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} />
      </div>

      <div className="privacy-check">
        <label htmlFor="enquiry-privacy">
          <input id="enquiry-privacy" name="privacy" type="checkbox" required checked={values.privacy} onChange={(event) => update("privacy", event.target.checked)} aria-invalid={Boolean(errors.privacy)} aria-describedby={describedBy("privacy")} />
          <span>I understand my details will be used to respond to my enquiry, as described in the <Link href="/privacy">privacy policy</Link>.</span>
        </label>
        {fieldError("privacy")}
      </div>

      <div className="form-submit">
        <button className="button button--dark" type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Sending…" : "Send project enquiry"}</button>
        <div className={`form-status form-status--${status}`} role="status" aria-live="polite">
          {status === "success" ? "Thanks for getting in touch. Your enquiry has been sent, and we'll be in touch as soon as possible." : null}
          {status === "error" ? <>Something went wrong sending your enquiry. Please try again, or email <a href="mailto:hello@wtrbmedia.co.uk">hello@wtrbmedia.co.uk</a> directly.</> : null}
        </div>
      </div>
    </form>
  );
}
