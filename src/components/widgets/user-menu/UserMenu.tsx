"use client";

import { useRouter } from "next/navigation";

import { LogOutIcon, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/ui";
import { logoutAction } from "@/server/actions/auth";

export function UserMenu() {
  const router = useRouter();
  const t = useTranslations();

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      router.push("/");
      router.refresh();
      if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
        console.log(error);
      }
    }
  };

  const handleProfile = () => router.push("/profile");

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handleProfile} title={t("User.profile")}>
        <UserIcon />
      </Button>
      <Button variant="outline" size="icon" onClick={handleLogout} title={t("Auth.logout")}>
        <LogOutIcon />
      </Button>
    </div>
  );
}
