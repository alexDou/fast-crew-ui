"use client";

import * as React from "react";

import { Link } from "@/i18n/navigation";

import { cn } from "@/lib/utils";
import { usePathname } from "@/i18n/navigation";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function NavLink({ href, icon, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      data-slot="nav-link"
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-transparent px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground",
        isActive && "bg-accent text-foreground",
        className
      )}
    >
      <span className="opacity-70 [&_svg]:size-4">{icon}</span>
      {children}
    </Link>
  );
}

export { NavLink };
