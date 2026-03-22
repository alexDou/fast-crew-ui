import { ErrorReport } from "@/components/error-report";
import { Dashboard } from "@/widgets";
import { getCurrentUser } from "@/server/actions/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <ErrorReport errorKey="user.network" />;
  }

  return (
    <div className="flex flex-1 flex-col bg-bento-beige p-8 lg:p-12">
      <Dashboard user={user} />
    </div>
  );
}
