// import { de } from "date-fns/locale";

import { DEFAULT_LOCALE } from "@/constants/i18n";
import type { SiteConfigType } from "@/types/site-config.type";
import { env } from "@/env";

// FIXME: Update site branding, default locale, theme color, social links, languages and OG image
export const siteConfig: SiteConfigType = {
  name: "AIsee.art",
  description: "Harness a crew of AI agents to generate an inspiration",
  url: env.NEXT_PUBLIC_SITE_URL,
  author: "alexDou",
  locale: DEFAULT_LOCALE,
  themeColor: "#ffffff",
  keywords: ["nextjs", "typescript", "aisee.art", "image processing", "AI", "crewai"],
  social: {
    github: "https://github.com/alexDou",
    linkedin: "https://www.linkedin.com/in/a-doo"
  },
  ogImage: "/og.jpg",
  languages: {
    de: "/de",
    en: "/en"
  }
} as const;
