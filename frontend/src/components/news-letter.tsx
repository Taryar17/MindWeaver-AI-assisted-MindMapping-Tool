import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

const emailSchema = z.object({
  email: z.string().email({
    message: "Enter Valid Email Address",
  }),
});

export default function NewsLetterForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof emailSchema>) {
    console.log(values);
    setLoading(true);
    //call APi
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid w-full pr-8 lg:pr-0"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="relative space-y-0">
              <FormLabel className="sr-only">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="mindweaver@gmail.com"
                  {...field}
                  className="pr-12"
                />
              </FormControl>
              <FormMessage />
              <Button
                size="icon"
                className="absolute top-1 right-[3.5px] size-7 z-20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Icons.paperplane className="size-3" aria-hidden="true" />
                )}

                <span className="sr-only">Join newsletter</span>
              </Button>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
