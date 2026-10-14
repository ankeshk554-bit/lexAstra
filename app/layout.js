import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";

const cormorantGaramond = { variable: "" };
const lora = { variable: "" };
const dmMono = { variable: "" };
const outfit = { variable: "" };

export const metadata = {
  title: {
    default: "LexAstra — Every Law. Every Case. Every Exam.",
    template: "%s | LexAstra",
  },
  description:
    "An Indian law study workspace with bare acts, landmark case summaries, exam syllabuses, a PDF reader and AI-assisted study.",
  keywords: [
    "Indian law",
    "bare acts",
    "case law",
    "CLAT preparation",
    "judiciary exam",
    "legal study",
    "law students India",
    "BNS 2023",
    "IPC",
    "Constitution of India",
  ],
  authors: [{ name: "LexAstra" }],
  openGraph: {
    title: "LexAstra — Every Law. Every Case. Every Exam.",
    description:
      "A focused workspace for studying Indian law.",
    type: "website",
    locale: "en_IN",
    siteName: "LexAstra",
  },
  twitter: {
    card: "summary_large_image",
    title: "LexAstra — India's Definitive Legal Study Platform",
    description:
      "Read Indian statutes, explore case summaries and prepare for law examinations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorantGaramond.variable} ${lora.variable} ${dmMono.variable} ${outfit.variable}`}
    >
      <head>
        {/* Google Analytics placeholder */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script> */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "LexAstra",
              description:
                "India's most trusted digital law library and exam preparation platform.",
              url: "https://lexastra.in",
              sameAs: [],
              areaServed: {
                "@type": "Country",
                name: "India",
              },
            }),
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="visually-hidden">
          Skip to main content
        </a>
        <ScrollProgressBar />
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
