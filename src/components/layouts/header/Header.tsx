import { cookies } from "next/headers";

import { HeaderNav } from "./header-nav";

export const Header = async () => {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("access_token")?.value;

  return <HeaderNav isAuthenticated={isAuthenticated} />;
};
