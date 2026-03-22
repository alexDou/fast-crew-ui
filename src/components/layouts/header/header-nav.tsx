"use client";

import { Link } from "@/i18n/navigation";

import { BookOpen, Home, LogIn, Palette, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { routesBook, routesPublic } from "@/lib/routes-book";

import { LocaleSwitcher, UserMenu } from "@/widgets";
import { NavLink } from "@/ui";

interface HeaderNavProps {
  isAuthenticated: boolean;
}

export function HeaderNav({ isAuthenticated }: HeaderNavProps) {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/85 px-6 py-4 backdrop-blur-xl lg:px-12">
      {/* Brand */}
      <Link
        href={routesBook.main}
        className="font-[family-name:var(--font-geist-sans)] text-[22px] font-bold tracking-tight text-foreground"
      >
        aisee<span className="text-bento-teal-muted">{"\u002E"}</span>art
      </Link>

      {/* Nav links + actions */}
      <nav className="flex items-center gap-1.5">
        <NavLink href={routesBook.main} icon={<Home />}>
          {t("home")}
        </NavLink>
        {isAuthenticated && (
          <>
            <NavLink href={routesBook.tuner} icon={<Palette />}>
              {t("tuner")}
            </NavLink>
            <NavLink href={routesBook.poems} icon={<BookOpen />}>
              {t("poems")}
            </NavLink>
          </>
        )}

        {/* Separator */}
        <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

        {!isAuthenticated ? (
          <>
            <NavLink href={routesPublic.signin} icon={<LogIn />}>
              {t("signin")}
            </NavLink>
            <NavLink href={routesPublic.signup} icon={<UserPlus />}>
              {t("signup")}
            </NavLink>
          </>
        ) : (
          <UserMenu />
        )}

        {/* Separator */}
        <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

        <LocaleSwitcher />
      </nav>
    </header>
  );
}
