"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

  const form = useForm<SignupFormValuesType>({
    resolver: zodResolver(createSignupSchema(tSchema)),
    defaultValues: { name: "", email: "", username: "", password: "", confirmPassword: "" }
  });
  const { control, handleSubmit } = form;

  const onSubmit = handleSubmit(async ({ name, email, username, password }) => {
    try {
      const result = await registerAction({ name, email, username, password });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(tForm("registration.success.title"), {
        description: tForm("registration.success.messsage")
      });

      router.push("/signin");
    } catch (err) {
      const error = err as Error;
      toast.error("Registration failed", {
        description: "An unexpected error occurred"
      });
      if (process.env.NEXT_PUBLIC_NODE_ENV) {
        console.error(error);
      }
    }
  });

  return (
    <section className="mt-16 w-full lg:w-1/3">
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
        </form>
      </Form>
    </section>
  );
}
