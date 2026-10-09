import { EnquiryForm } from "@/components/forms/enquiry-form";
import { Reveal } from "@/components/ui/reveal";

export function Contact() {
  return (
    <section id="contact" className="section section--contact" aria-labelledby="contact-title">
      <div className="page-shell">
        <Reveal className="contact-heading">
          <p className="eyebrow">Start a project</p>
          <h2 id="contact-title" className="contact-title text-balance">Have a story worth telling?</h2>
          <p className="contact-copy">Tell us what you&apos;re creating. We&apos;ll help bring it to life.</p>
        </Reveal>
        <EnquiryForm />
      </div>
    </section>
  );
}
