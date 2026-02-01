"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createSigninSchema, type SigninFormValuesType } from "./signin.schema";
import { loginAction } from "@/server/actions/auth";

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

export function SigninForm() {
  const tForm = useTranslations("AuthForm");
  const tSchema = useTranslations("AuthSchema");
  const router = useRouter();

  const form = useForm<SigninFormValuesType>({
    resolver: zodResolver(createSigninSchema(tSchema)),
    defaultValues: { username: "", password: "" }
  });
  const { control, handleSubmit } = form;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await loginAction(data.username, data.password);

      if (!result.success) {
        throw new Error(result.error);
      }

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
      if (process.env.NEXT_PUBLIC_NODE_ENV) { 
        console.error(error); 
      }
    }
  });

  return (
    <section className="col-span-3 mt-16 space-y-5 lg:col-span-1">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-5">
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

          <Button type="submit" className="w-full">
            {tForm("submit")}
          </Button>
        </form>
      </Form>
    </section>
  );
}
