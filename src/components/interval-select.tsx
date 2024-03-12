"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Operation } from "@/components/admin-table/rows";
import { toast } from "sonner";
import { useEffect } from "react";

export const intervalTypeSchema = z.enum([
  "default",
  "slow",
  "manual",
  "custom",
]);
const FormSchema = z.object({
  interval: intervalTypeSchema,
  customInterval: z.string().optional(),
});

export type IntervalConfig = z.infer<typeof FormSchema>;
export const defaultIntervalConfig: IntervalConfig = {
  interval: "manual",
};

export type IntervalSelectProps = {
  onRun: () => Promise<unknown>;
  setIntervalConfig: (intervalConfig: IntervalConfig) => void;
};

export function IntervalSelect(props: IntervalSelectProps) {
  const { onRun, setIntervalConfig } = props;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: defaultIntervalConfig,
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // console.log("SUBMITTING: data", data);
    setIntervalConfig(data);
  }

  const options = [
    {
      value: "default",
      label: "Default",
    },
    {
      value: "slow",
      label: "Slow",
    },
    {
      value: "manual",
      label: "Manual",
    },
    {
      value: "custom",
      label: "Custom",
    },
  ];

  const intervalValue = form.watch("interval");
  const customIntervalValue = form.watch("customInterval");
  const isManual = intervalValue === "manual";
  const isCustom = intervalValue === "custom";

  useEffect(() => {
    setIntervalConfig({
      interval: intervalValue,
      customInterval: customIntervalValue,
    });
  }, [intervalValue, customIntervalValue]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 gap-1"
      >
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem
              className="w-[105px]"
              onClick={() => {
                console.log("form data: ", form.getValues());
              }}
            >
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Interval" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />
        {isManual && (
          <Button
            variant={"secondary"}
            type="button"
            onClick={() => {
              onRun();
              // console.log("run sync query", operation.dbTableName);
            }}
          >
            Run
          </Button>
        )}
        {isCustom && (
          <FormField
            control={form.control}
            name="customInterval"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="custom interval"
                    type="number"
                    className="w-[70px]"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  );
}
