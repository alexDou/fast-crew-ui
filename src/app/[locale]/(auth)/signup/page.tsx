import { useTranslations } from "next-intl";

import { RegisterForm } from "@/widgets";

export default function SignupPage() {
  const t = useTranslations("Auth");

  return (
    <div className="flex flex-1 items-center justify-center p-6 lg:p-8">
      <div className="w-full max-w-md bg-bento-beige p-8 lg:p-10 [&_[data-slot=button]]:bg-bento-beige-text [&_[data-slot=button]]:text-bento-beige [&_[data-slot=button]]:hover:bg-bento-beige-text/85 [&_[data-slot=form-label]]:text-bento-beige-muted [&_[data-slot=input]]:border-bento-beige-accent/25 [&_[data-slot=input]]:text-bento-beige-text [&_[data-slot=input]]:placeholder:text-bento-beige-subtle [&_[data-slot=label]]:text-bento-beige-muted">
        <h2 className="mb-6 text-center font-[family-name:var(--font-playfair)] text-2xl font-bold text-bento-beige-text">
          {t("signup")}
        </h2>
        <RegisterForm />
      </div>
    </div>
  );
}
