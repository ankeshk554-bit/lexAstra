import Link from "next/link";
export default function Footer() {
  return (
    <footer className="study-footer">
      <div className="container">
        <div>
          <strong>LexAstra</strong>
          <p>A focused workspace for studying Indian law.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/bare-acts">Bare acts</Link>
          <Link href="/case-law">Case law</Link>
          <Link href="/exams">Exam prep</Link>
          <Link href="/pdf-reader">Your PDFs</Link>
        </nav>
        <p className="study-footer__note">
          For educational use. Verify legal provisions, amendments and judgments
          against official sources.
        </p>
      </div>
    </footer>
  );
}
