"use client";

import { useRouter } from "@/i18n/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { env } from "@/env";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from "@/ui";
import { loginAction, resendVerificationAction } from "@/server/actions/auth";

import { createSigninSchema, type SigninFormValuesType } from "./signin.schema";

export function SigninForm() {
  const tForm = useTranslations("AuthForm");
  const tSchema = useTranslations("AuthSchema");
  const router = useRouter();

  const form = useForm<SigninFormValuesType>({
    resolver: zodResolver(createSigninSchema(tSchema)),
    defaultValues: { username: "", password: "" }
  });
  const { control, handleSubmit } = form;
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  const handleResendVerification = async () => {
    const identifier = form.getValues("username").trim();
    if (!identifier) {
      toast.error(tForm("signin.error.title"), {
        description: tForm("signin.resendVerification.missingIdentifier")
      });
      return;
    }

    try {
      setIsResendingVerification(true);
      const result = await resendVerificationAction(identifier);
      if (!result.success) {
        toast.error(tForm("signin.error.title"), {
          description: result.error || tForm("signin.error.message")
        });
        return;
      }

      toast.success(tForm("signin.resendVerification.success.title"), {
        description: tForm("signin.resendVerification.success.message")
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await loginAction(data.username, data.password);

      if (!result.success) {
        const shouldShowResend = result.error?.toLowerCase().includes("not yet verified") ?? false;
        setShowResendVerification(shouldShowResend);

        toast.error(tForm("signin.error.title"), {
          description: shouldShowResend
            ? tForm("signin.error.notVerified")
            : result.error || tForm("signin.error.message")
        });
        return;
      }

      setShowResendVerification(false);

      toast.success(tForm("signin.success.title"), {
        description: tForm("signin.success.message")
      });

      router.push("/");
      router.refresh();
    } catch (err) {
      const error = err as Error;
      toast.error(tForm("signin.error.title"), {
        description: tForm("signin.error.message")
      });
      if (env.NEXT_PUBLIC_NODE_ENV) {
        console.error(error);
      }
    }
  });

  return (
    <section className="space-y-5">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            control={control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("usernameLoginLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tForm("usernamePlaceholder")}
                    autoComplete="username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("passwordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={tForm("passwordPlaceholder")}
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {tForm("submit")}
          </Button>

          {showResendVerification ? (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResendingVerification}
              className="mx-auto block text-sm text-bento-beige-muted underline-offset-4 transition hover:underline disabled:opacity-60"
            >
              {isResendingVerification
                ? tForm("signin.resendVerification.loading")
                : tForm("signin.resendVerification.link")}
            </button>
          ) : null}
        </form>
      </Form>
    </section>
  );
}
