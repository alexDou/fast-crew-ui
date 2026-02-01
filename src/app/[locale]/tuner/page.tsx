import { ErrorReport } from "@/components/error-report";
import { TunerForm } from "@/components/tuner";

import { getCurrentUser } from "@/server/actions/auth";

export default async function TunerPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <ErrorReport errorKey="user.network" />;
  }

  return <TunerForm />;
}
