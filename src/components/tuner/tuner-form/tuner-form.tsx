"use client";

import { useState } from "react";
import Image from "next/image";

import { Upload } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Balancer } from "react-wrap-balancer";

import { PROCESSING_STATUS } from "@/constants/status";

import { useSourceCreate } from "@/hooks";

import { ErrorReport } from "@/components/error-report";
import { TunerResult } from "@/components/tuner";
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

import { type TunerFormValuesType, tunerFormSchema } from "./tuner.schema";

export function TunerForm() {
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);
  const t = useTranslations("Tuner");

  const { sourceCreate, processing, sourceId } = useSourceCreate();

  const form = useForm<TunerFormValuesType>({
    resolver: zodResolver(tunerFormSchema(t)),
    defaultValues: { file: void 0, enhance: "" }
  });
  const { control, handleSubmit } = form;

  const onSubmit = handleSubmit(async ({ file, enhance }) => {
    await sourceCreate({ file, enhance });
  });

  return (
    <div className="container flex flex-col items-center justify-center gap-6">
      <section className="mt-16 flex w-full items-center justify-center lg:w-1/3">
        {imagePreview ? (
          <Image
            src={imagePreview.toString()}
            alt="Preview"
            width={200}
            height={200}
            className="aspect-1/1 object-cover"
          />
        ) : null}
      </section>
      {processing === PROCESSING_STATUS.IDLE && (
        <section className="t-16 lg:w-1/3">
          <Form {...form}>
            <form onSubmit={onSubmit} className="w-full space-y-5">
              <FormField
                control={control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex w-full items-center justify-center">
                      <FormLabel className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-base border border-default-strong border-dashed bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-body">
                          <Upload className="mb-4 h-8 w-8" />
                          <Balancer className="mb-2 text-sm">{t("form.file.label")}</Balancer>
                          <Balancer className="text-xs">{t("form.file.prompt")}</Balancer>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="file"
                            className="hidden"
                            value={void 0}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagePreview(reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </FormControl>
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="enhance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.enhance.label")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.enhance.placeholder")}
                        autoComplete="enhance"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {t("form.submit")}
              </Button>
            </form>
          </Form>
        </section>
      )}
      {processing === PROCESSING_STATUS.PROCESSING && sourceId && (
        <TunerResult sourceId={sourceId} />
      )}
      {processing === PROCESSING_STATUS.ERROR && <ErrorReport errorKey="file.network" />}
    </div>
  );
}
