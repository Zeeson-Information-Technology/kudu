import Image from "next/image";
import Link from "next/link";
import { FaLinkedin, FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { site } from "../content/site";

export function Footer() {
  const year = new Date().getFullYear();
  const productLinks = site.nav.slice(0, 3); // Home, Product, About
  const companyLinks = [
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" }
  ];

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="footer-main">
          <div className="footer-brand">
            <Image
              src="/brand/logo-lockup.png"
              alt={site.name}
              width={300}
              height={88}
              className="footer-logo"
            />
            <p className="footer-description">
              {site.tagline}
            </p>
            <p className="footer-note">
              Offline-first, consent-driven primary healthcare platform designed for low-connectivity clinics.
            </p>
          </div>

          <div className="footer-right">
            <div className="footer-section">
              <h3 className="footer-heading">Product</h3>
              <div className="footer-links">
                {productLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="footer-section">
              <h3 className="footer-heading">Company</h3>
              <div className="footer-links">
                {companyLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="footer-section">
              <h3 className="footer-heading">Legal</h3>
              <div className="footer-links">
                {site.footerLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="footer-section">
              <h3 className="footer-heading">Connect</h3>
              <div className="footer-social">
                {site.socialLinks.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    className="footer-social-link"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                  {social.icon === 'linkedin' && <FaLinkedin />}
                  {social.icon === 'facebook' && <FaFacebookF />}
                  {social.icon === 'twitter' && <FaTwitter />}
                  {social.icon === 'instagram' && <FaInstagram />}
                    <span className="sr-only">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-meta">
            <p>&copy; {year} {site.name}. {site.rights}</p>
          </div>
          <div className="footer-tagline">
            <p>{site.footerNote}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
