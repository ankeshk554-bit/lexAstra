"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, Menu, X, ArrowUpRight } from "lucide-react";
const links = [
  ["/bare-acts", "Bare acts"],
  ["/case-law", "Case law"],
  ["/exams", "Exam prep"],
  ["/current-affairs", "Legal digest"],
  ["/pdf-reader", "PDF workspace"],
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <nav className="study-nav" aria-label="Main navigation">
      <div className="study-nav__inner">
        <Link href="/" className="study-brand" aria-label="LexAstra home">
          <span className="study-brand__icon">
            <Scale size={21} />
          </span>
          Lex<span>Astra</span>
        </Link>
        <div className="study-nav__desktop">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </div>
        <Link href="/ai-assistant" className="btn btn--primary study-nav__ai">
          Ask AI <ArrowUpRight size={15} />
        </Link>
        <button
          className="study-nav__toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="study-nav__mobile" id="mobile-navigation">
          {[
            ["/", "Study desk"],
            ...links,
            ["/ai-assistant", "AI assistant"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
