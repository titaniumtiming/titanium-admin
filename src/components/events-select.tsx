"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { eventsData, useGlobalStore } from "@/store";

// const eventsSchema = z.array(z.record(z.string().trim()));
const eventsSchema = z.array(z.record(z.string(), z.string()));

const formSchema = z.object({
  events: z.array(z.string()),
});

export interface EventsSelectProps {}

const allValues = eventsData.map((event) => event.value);
export function EventsSelect(props: EventsSelectProps) {
  const {} = props;

  const setSelectedEvents = useGlobalStore((state) => state.setSelectedEvents);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      events: allValues,
    },
    mode: "onBlur",
  });

  const onHandleSubmit = (values: z.infer<typeof formSchema>) => {
    const events = values.events;

    setSelectedEvents(events);
  };

  return (
    <>
      <Form {...form}>
        <form
        // onSubmit={form.handleSubmit(onHandleSubmit)}
        >
          <ErrorBoundary
            errorComponent={() => {
              return <div>error</div>;
            }}
          >
            <FormField
              control={form.control}
              name="events"
              render={({ field }) => (
                <FormItem className="w-[190px]">
                  <MultiSelect
                    selected={field.value}
                    options={eventsData}
                    selectAll
                    {...field}
                    onBlur={form.handleSubmit(onHandleSubmit)}
                  />
                </FormItem>
              )}
            />
          </ErrorBoundary>
          {/* <Button type="submit" className="w-full">
            Continue
          </Button> */}
        </form>
      </Form>
    </>
  );
}
