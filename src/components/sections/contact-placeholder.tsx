import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

export function ContactPlaceholder() {
  return (
    <section id="contact" className="section section--contact" aria-labelledby="contact-title">
      <Reveal className="contact-inner page-shell">
        <p className="eyebrow">Start a project</p>
        <h2 id="contact-title" className="contact-title text-balance">Have a story worth going outside for?</h2>
        <p className="contact-copy">Tell us what you are planning, where it could take us, and what success looks like.</p>
        <Link className="button button--dark" href="mailto:hello@wtrbmedia.co.uk">hello@wtrbmedia.co.uk</Link>
        <p className="contact-note">Full project enquiry form coming in the next phase.</p>
      </Reveal>
    </section>
  );
}
