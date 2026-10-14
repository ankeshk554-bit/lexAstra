import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Scale,
  GraduationCap,
  FileText,
  Sparkles,
  Newspaper,
} from "lucide-react";
import { actAliases } from '@/utils/actAliases';
import StudySearch from "@/components/StudySearch";
import { bareActs } from "@/data/bareActs";
import { caseLaw } from "@/data/caseLaw";
import { exams } from "@/data/exams";
const tools = [
  {
    href: "/bare-acts",
    icon: BookOpen,
    label: "01 / LEGISLATION",
    title: "Read the law",
    text: "Search provisions, navigate chapters and compare the old and new criminal laws.",
    action: "Explore bare acts",
  },
  {
    href: "/case-law",
    icon: Scale,
    label: "02 / JUDGMENTS",
    title: "Understand the precedent",
    text: "Find the holding, citation and exam relevance of landmark Indian judgments.",
    action: "Browse case summaries",
  },
  {
    href: "/exams",
    icon: GraduationCap,
    label: "03 / PREPARATION",
    title: "Build your study plan",
    text: "Work through your syllabus, track completed topics and practise exam questions.",
    action: "Choose your exam",
  },
  {
    href: "/pdf-reader",
    icon: FileText,
    label: "04 / YOUR DOCUMENTS",
    title: "Make reading active",
    text: "Open a PDF, search its text, highlight provisions and keep your notes in one workspace.",
    action: "Open PDF workspace",
  },
];
export default function HomePage() {
  const items = [
    ...bareActs.map((a) => ({
      kind: "Bare act",
      title: a.name,
      keywords: `${actAliases[a.slug] || ''} ${a.year} ${a.description}`,
      href: `/bare-acts/${a.slug}`,
    })),
    ...caseLaw.map((c) => ({
      kind: "Case law",
      title: c.name,
      keywords: c.citation + " " + c.ratio,
      href: `/case-law/${c.id}`,
    })),
    ...exams.map((e) => ({
      kind: "Exam",
      title: e.name,
      keywords: e.fullName,
      href: `/exams/${e.slug}`,
    })),
  ];
  return (
    <div className="study-home">
      <section className="study-hero container">
        <div className="study-hero__copy">
          <p className="eyebrow">
            <span /> YOUR INDIAN LAW STUDY DESK
          </p>
          <h1>
            Less searching.
            <br />
            More <em>understanding.</em>
          </h1>
          <p className="study-hero__description">
            The law, the cases, and your next exam. A focused workspace to
            connect what you read with what you need to learn.
          </p>
          <div className="study-hero__actions">
            <Link href="/bare-acts" className="btn btn--primary">
              Start with the law <ArrowRight size={17} />
            </Link>
            <Link href="/exams" className="btn btn--ghost">
              Find my exam
            </Link>
          </div>
          <div className="study-hero__counts">
            <span>
              <strong>{bareActs.length}</strong> Acts in the library
            </span>
            <span>
              <strong>{caseLaw.length}</strong> Case summaries
            </span>
            <span>
              <strong>{exams.length}</strong> Exam guides
            </span>
          </div>
        </div>
        <StudySearch items={items} />
      </section>
      <section className="container study-tools">
        <div className="study-section-heading">
          <div>
            <p className="eyebrow">A CLEAR PATH THROUGH YOUR STUDIES</p>
            <h2>What are you working on?</h2>
          </div>
          <span>Choose a task. Get straight to work.</span>
        </div>
        <div className="study-tool-grid">
          {tools.map(({ icon: Icon, ...t }) => (
            <Link href={t.href} key={t.href} className="study-tool">
              <div className="study-tool__top">
                <span className="study-tool__icon">
                  <Icon size={24} />
                </span>
                <ArrowRight size={19} />
              </div>
              <small>{t.label}</small>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <span className="study-tool__action">
                {t.action} <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="container study-bottom">
        <div className="study-update">
          <p className="eyebrow">CRIMINAL LAW TRANSITION</p>
          <h2>New codes. Connected context.</h2>
          <p>
            Study BNS, BNSS and BSA alongside their predecessor laws. Transition
            notes help you keep the frameworks distinct.
          </p>
          <div className="study-code-links">
            {bareActs
              .filter((a) => a.isNew)
              .map((a) => (
                <Link key={a.id} href={`/bare-acts/${a.slug}`}>
                  {a.name} <ArrowRight size={16} />
                </Link>
              ))}
          </div>
        </div>
        <div className="study-companions">
          <Link href="/ai-assistant">
            <Sparkles size={22} />
            <div>
              <h3>Talk through a legal concept</h3>
              <p>
                Use exam-specific prompts with the AI assistant. Requires a
                configured API key.
              </p>
            </div>
            <ArrowRight size={19} />
          </Link>
          <Link href="/current-affairs">
            <Newspaper size={22} />
            <div>
              <h3>Review the legal digest</h3>
              <p>Curated developments with dates and exam relevance.</p>
            </div>
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>
    </div>
  );
}
