"use client";

import { useRouter } from "next/navigation";

import { HomeIcon } from "lucide-react";

import { routesBook } from "@/lib/routes-book";

import { Button } from "@/ui";

export const PrivateNav = () => {
  const router = useRouter();

  const navMain = () => router.push(routesBook.main);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:flex-row">
      <Button variant="outline" size="icon" onClick={navMain}>
        <HomeIcon />
      </Button>
    </div>
  );
};
