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
    "India's most trusted legal study platform. Access 500+ Bare Acts, 10,000+ case summaries, exam preparation for Judiciary, CLAT, CUET, APO, and AI-powered legal assistance.",
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
      "India's most trusted legal study platform for law students.",
    type: "website",
    locale: "en_IN",
    siteName: "LexAstra",
  },
  twitter: {
    card: "summary_large_image",
    title: "LexAstra — India's Definitive Legal Study Platform",
    description:
      "Access 500+ Bare Acts, 10,000+ case summaries, and AI-powered exam prep.",
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
      className={`${cormorantGaramond.variable} ${lora.variable} ${dmMono.variable} ${outfit.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Lora:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
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
