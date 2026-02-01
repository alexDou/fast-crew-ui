import { Dashboard } from "@/widgets";

import { getCurrentUser } from "@/server/actions/auth";

import { ErrorReport } from "@/components/error-report";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <ErrorReport errorKey="user.network" />
    );
  }

  return (
    <section className="flex flex-col items-center justify-center pb-40">
      <Dashboard user={user} />
    </section>
  );
}
