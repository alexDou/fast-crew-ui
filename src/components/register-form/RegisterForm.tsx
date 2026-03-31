"use client";

import { useCallback, useState } from "react";
import { useRouter } from "@/i18n/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ERROR_MESSAGES } from "@/constants/api";
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
import { registerAction } from "@/server/actions/auth";

import { createSignupSchema, type SignupFormValuesType } from "./singup.schema";

export function RegisterForm() {
  const tForm = useTranslations("AuthForm");
  const tSchema = useTranslations("AuthSchema");
  const router = useRouter();
  const [recaptchaInstance, setRecaptchaInstance] = useState<ReCAPTCHA | null>(null);
  const reCaptchaSiteKey = env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const handleRecaptchaRef = useCallback((instance: ReCAPTCHA | null) => {
    setRecaptchaInstance(instance);
  }, []);

  const form = useForm<SignupFormValuesType>({
    resolver: zodResolver(createSignupSchema(tSchema)),
    defaultValues: { name: "", email: "", username: "", password: "", confirmPassword: "" }
  });
  const { control, handleSubmit } = form;

  const onSubmit = handleSubmit(async ({ name, email, username, password }) => {
    if (!reCaptchaSiteKey || !recaptchaInstance) {
      toast.error(tForm("registration.error.title"), {
        description: tForm("registration.error.captchaUnavailable")
      });
      return;
    }

    try {
      const captchaToken = await recaptchaInstance.executeAsync();
      recaptchaInstance.reset();

      if (!captchaToken) {
        toast.error(tForm("registration.error.title"), {
          description: tForm("registration.error.captchaFailed")
        });
        return;
      }

      const result = await registerAction({ name, email, username, password, captchaToken });

      if (!result.success) {
        const errorDescription =
          result.error === ERROR_MESSAGES.CAPTCHA_VALIDATION_FAILED
            ? tForm("registration.error.captchaFailed")
            : result.error || tForm("registration.error.message");

        toast.error(tForm("registration.error.title"), {
          description: errorDescription
        });
        return;
      }

      toast.success(tForm("registration.success.title"), {
        description: tForm("registration.success.message")
      });

      router.push("/signin");
    } catch (err) {
      const error = err as Error;
      toast.error(tForm("registration.error.title"), {
        description: tForm("registration.error.message")
      });
      if (env.NEXT_PUBLIC_NODE_ENV) {
        console.error(error);
      }
    }
  });

  return (
    <section className="w-full">
      <Form {...form}>
        <form onSubmit={onSubmit} className="w-full space-y-5">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("nameLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={tForm("namePlaceholder")} autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("emailLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={tForm("emailPlaceholder")} autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("usernameLabel")}</FormLabel>
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

          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("confirmPasswordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={tForm("confirmPasswordPlaceholder")}
                    autoComplete="confirmPassword"
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

          {reCaptchaSiteKey ? (
            <ReCAPTCHA ref={handleRecaptchaRef} sitekey={reCaptchaSiteKey} size="invisible" />
          ) : null}
        </form>
      </Form>
    </section>
  );
}
