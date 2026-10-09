import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How WtRB Media handles personal information submitted through this website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <a className="skip-link" href="#privacy-content">Skip to content</a>
      <SiteHeader />
      <main id="privacy-content" className="legal-page page-shell">
        <p className="eyebrow">Privacy</p>
        <h1>Privacy policy</h1>
        <p className="legal-page__intro">This policy explains how WtRB Media uses the information you provide when making a project enquiry.</p>

        <section><h2>Who is responsible for your information</h2><p>WtRB Media is responsible for personal information collected through this website. For privacy questions or requests, email <a href="mailto:hello@wtrbmedia.co.uk">hello@wtrbmedia.co.uk</a>.</p></section>
        <section><h2>Information we collect</h2><p>The enquiry form may collect your name, organisation, email address, project type, shoot location, preferred timeframe, indicative budget and the project information you choose to provide. Basic technical information may also be processed to protect the form from abuse.</p></section>
        <section><h2>Why we use it</h2><p>We use enquiry information to understand your brief, respond to you and take steps towards a potential project. The lawful basis will generally be taking steps at your request before entering a contract and, where appropriate, our legitimate interests in managing genuine business enquiries and protecting this website.</p></section>
        <section><h2>Email delivery and hosting</h2><p>Form notifications are delivered using Resend and business correspondence is handled through Zoho Mail. These providers process information on our behalf. Their processing locations and contractual safeguards should be reviewed as part of the owner&apos;s supplier and international-transfer assessment before publication.</p></section>
        <section><h2>How long information is kept</h2><p>We keep enquiry information only for as long as it is reasonably needed to respond, manage a potential or active project, meet legal obligations and resolve disputes. A specific retention schedule must be approved by the owner before this policy is published.</p></section>
        <section><h2>YouTube films</h2><p>Portfolio films may be delivered by YouTube using its privacy-enhanced domain. YouTube&apos;s player and API are not loaded when the page first opens. If you choose to load an embedded film, your browser connects to YouTube and Google may receive technical information or use device storage under its own policies. The site asks before loading each YouTube player; declining leaves the rest of the website available.</p></section>
        <section><h2>Sharing and security</h2><p>Information is shared only with service providers needed to handle the enquiry, or where required by law. Reasonable technical and organisational measures are used to protect submissions. No internet transmission can be guaranteed completely secure.</p></section>
        <section><h2>Your data protection rights</h2><p>Depending on the circumstances, you may have rights to access, correct, erase or restrict use of your information, object to certain processing, and complain to the UK Information Commissioner&apos;s Office. Contact us first at <a href="mailto:hello@wtrbmedia.co.uk">hello@wtrbmedia.co.uk</a> so we can respond to your request.</p></section>
        <aside className="legal-review"><h2>Owner review required before publication</h2><p>Confirm the data-controller identity and contact details, approve a retention schedule, review Resend and Zoho data-processing terms and transfer safeguards, and confirm whether an ICO data protection fee or registration applies. Add a postal contact only when an appropriate business address is approved.</p></aside>
        <Link className="text-link" href="/">← Return to the website</Link>
      </main>
      <SiteFooter />
    </>
  );
}
