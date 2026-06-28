import { APP_NAME } from "@/lib/utils";
import {
  COMPANY_NAME,
  DEFAULT_DESCRIPTION,
  SITE_URL,
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
} from "./constants";
import { absoluteUrl } from "./metadata";

export interface FaqItem {
  question: string;
  answer: string;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    legalName: COMPANY_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icons/icon.svg"),
    description: DEFAULT_DESCRIPTION,
    email: SUPPORT_EMAIL,
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    sameAs: Object.values(SOCIAL_LINKS),
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      name: COMPANY_NAME,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/clubs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    operatingSystem: "Android, iOS, Web",
    applicationCategory: "SportsApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    downloadUrl: absoluteUrl("/download"),
    featureList: [
      "Live pickleball match scoring",
      "Tournament brackets and fixtures",
      "Player rankings and stats",
      "Club discovery and court booking",
      "DUPR rating sync",
      "Live spectator scoreboards",
    ],
  };
}

export function faqPageJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function localBusinessPageJsonLd(city: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Pickleball in ${city} — ${APP_NAME}`,
    url: absoluteUrl(path),
    description: `Find pickleball clubs, tournaments, live scores, and players in ${city} with ${APP_NAME}.`,
    about: {
      "@type": "SportsActivityLocation",
      name: `Pickleball community in ${city}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressCountry: "IN",
      },
    },
  };
}
