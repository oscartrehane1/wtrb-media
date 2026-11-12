import { EnquiryForm } from "@/components/forms/enquiry-form";
import { Reveal } from "@/components/ui/reveal";

export function Contact() {
  return (
    <section id="contact" className="section section--contact" aria-labelledby="contact-title">
      <div className="page-shell">
        <Reveal className="contact-heading">
          <p className="eyebrow">Start a project</p>
          <h2 id="contact-title" className="contact-title text-balance">Let&apos;s make something that matters.</h2>
          <p className="contact-copy">Have a destination to promote, a product to launch or a story worth telling? Let&apos;s build a campaign around it.</p>
        </Reveal>
        <EnquiryForm />
      </div>
    </section>
  );
}
