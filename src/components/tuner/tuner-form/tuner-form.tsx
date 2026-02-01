"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Balancer } from "react-wrap-balancer";
import { ErrorReport } from "@/components/error-report";
import { TunerResult } from "@/components/tuner";

import { Upload } from "lucide-react"

import { tunerFormSchema, type TunerFormValuesType } from "./tuner.schema";
import { useSourceCreate } from "@/hooks";

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
      <section className="flex items-center justify-center mt-16 w-full lg:w-1/3">
        {imagePreview ? <Image src={imagePreview.toString()} alt="Preview" width={200} height={200} className="aspect-1/1 object-cover" /> : null}
      </section>
      {processing === 'idle' && <section className="t-16 lg:w-1/3">
        <Form {...form}>
          <form onSubmit={onSubmit} className="w-full space-y-5 ">
            <FormField
              control={control}
              name="file"              
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-center w-full">
                    <FormLabel className="flex flex-col items-center justify-center w-full h-64 bg-neutral-secondary-medium border border-dashed border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium">
                      <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4" />
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
      </section>}
      {processing === 'processing' && sourceId && <TunerResult sourceId={sourceId} />}
      {processing === 'error' && <ErrorReport errorKey="file.network" />}
    </div>
  );
}
