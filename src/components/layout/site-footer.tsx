import Link from "next/link";
import { navigationItems } from "@/content/site";
import { Wordmark } from "@/components/ui/wordmark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top page-shell">
        <div>
          <Wordmark />
          <p className="site-footer__tagline">Stories Made Outside.</p>
        </div>
        <nav className="site-footer__nav" aria-label="Footer navigation">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="site-footer__contact">
          <p>Start a conversation</p>
          <a href="mailto:hello@wtrbmedia.co.uk">hello@wtrbmedia.co.uk</a>
        </div>
      </div>
      <div className="site-footer__bottom page-shell">
        <div className="brand-mark-placeholder" aria-label="Secondary brand mark placeholder">Brand mark</div>
        <p>© {new Date().getFullYear()} WtRB Media</p>
        <div className="site-footer__legal">
          <Link href="#">Privacy</Link>
          <Link href="#">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
