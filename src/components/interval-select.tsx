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

export function IntervalSelect() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: {
      interval: "default",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    alert(JSON.stringify(data, null, 2));
    // toast({
    //   title: "You submitted the following values:",
    //   description: (
    //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // });
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
  const isManual = intervalValue === "manual";
  const isCustom = intervalValue === "custom";

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
            <FormItem className="w-[105px]">
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
          <Button variant={"secondary"} type="button">
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
