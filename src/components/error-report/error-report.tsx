"use client"

import { useTranslations } from "next-intl";

import Balancer from "react-wrap-balancer";

const translationErrorKeys = {
  "user.network": {
    error: "User.networkError",
    message: "User.networkErrorMessage"
  },
  "file.network": {
    error: "Tuner.error.fileNetworkError",
    message: "Tuner.error.fileNetworkErrorMessage"
  }
}

type ErrorReportPropsType = {
  errorKey: keyof typeof translationErrorKeys;
}

export const ErrorReport = ({ errorKey }: ErrorReportPropsType) => {
  const t = useTranslations();

  return (
    <section className="container flex flex-col items-center justify-center py-16">
      <Balancer as="h1" className="text-2xl font-bold text-red-500">
        {t(translationErrorKeys[errorKey].error)}
      </Balancer>
      <Balancer as="p" className="text-base font-bold text-red-800">
        {t(translationErrorKeys[errorKey].message)}
      </Balancer>
    </section>
  );
};
