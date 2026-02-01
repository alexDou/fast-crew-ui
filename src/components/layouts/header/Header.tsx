import { cookies } from "next/headers";

import { LocaleSwitcher, ThemeSwitcher, PrivateNav, UserMenu } from "@/widgets";

export const Header = async () => {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("access_token")?.value;

  return (
    <header className="flex items-center justify-center gap-2 py-8">
      <PrivateNav />
      {isAuthenticated && <UserMenu />}
      <ThemeSwitcher />
      <LocaleSwitcher />
    </header>
  );
};
