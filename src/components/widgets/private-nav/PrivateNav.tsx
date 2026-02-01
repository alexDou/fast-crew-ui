"use client";

import { useRouter } from "next/navigation";

import { HomeIcon } from "lucide-react";
import { Button } from "@/ui";

import { routesBook } from "@/lib/routes-book";

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
