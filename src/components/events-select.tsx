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

// const eventsSchema = z.array(z.record(z.string().trim()));
const eventsSchema = z.array(z.record(z.string(), z.string()));

const formSchema = z.object({
  events: z.array(z.string()),
});

export interface EventsSelectProps {}

export function EventsSelect(props: EventsSelectProps) {
  const {} = props;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      events: [
        // "author1",
        // { value: "author1", label: "Author 1" },
        // { value: "author2", label: "Author 2" },
      ],
    },
    mode: "onBlur",
  });

  const onHandleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log({ values });
  };

  const eventsData = [
    {
      value: "author1",
      label: "Author 1",
    },
    {
      value: "author2",
      label: "Author 2",
    },
    {
      value: "author3",
      label: "Author 3",
    },
    {
      value: "author4",
      label: "Author 4",
    },
  ];

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onHandleSubmit)}
          className="space-y-4"
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
                <FormItem className="mb-5">
                  {/* <FormLabel>Author</FormLabel> */}
                  <MultiSelect
                    selected={field.value}
                    // selected={field.value}
                    options={eventsData}
                    // selectAll
                    {...field}
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
