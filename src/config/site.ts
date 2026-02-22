import { de } from "date-fns/locale";

import { DEFAULT_LOCALE } from "@/constants/i18n";
import type { SiteConfigType } from "@/types/site-config.type";
import { env } from "@/env";

// FIXME: Update site branding, default locale, theme color, social links, languages and OG image
export const siteConfig: SiteConfigType = {
  name: "Poets crew",
  description: "Upload your image and covert it to a poem",
  url: env.NEXT_PUBLIC_SITE_URL,
  author: "alexDou",
  locale: DEFAULT_LOCALE,
  themeColor: "#ffffff",
  keywords: ["nextjs", "typescript", "poets crew", "image processing", "AI", "crewai"],
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
