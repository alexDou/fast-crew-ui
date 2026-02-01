import { RegisterForm } from "@/widgets";
import { Balancer } from "react-wrap-balancer";

import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();
  
  return (
    <div className="container py-16">
      <section className="flex flex-col items-center justify-center pb-10">
        <Balancer
          as="h1"
          className="text-center text-2xl font-bold text-black lg:text-5xl dark:text-white"
        >
          {t("Dashboard.title")}
        </Balancer>
      </section>
      <section className="flex flex-col items-center justify-center">
        <Balancer
          as="h3"
          className="text-center text-xl font-bold text-black lg:text-2xl dark:text-white"
        >
          {t("Auth.signup")}
        </Balancer>
      </section>
      <section className="flex flex-col items-center justify-center pb-40">
        <RegisterForm />
      </section>
    </div>
  );
}
