import {
  Link,
  useActionData,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Icons } from "../../components/icons";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";

const FormSchema = z.object({
  email: z.email("Invalid Email"),
});

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData() as { error?: string } | undefined;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    submit(values, { method: "post", action: "." });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Link to="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <Icons.logo className="mr-2 h-6 w-6" aria-hidden="true" />
            </div>
          </Link>
          <h1 className="text-xl font-bold">Reset Password</h1>
          <div className="text-center text-sm">
            Remember your password?{" "}
            <a href="/login" className="underline underline-offset-4">
              Sign In
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                autoComplete="off"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="0977**********"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {actionData && (
                  <p className="text-xs text-red-400">{actionData?.error}</p>
                )}
                <div className="grid gap-4">
                  <Button
                    type="submit"
                    className="mt-2 w-full"
                    disabled={navigation.state === "submitting"}
                  >
                    {navigation.state === "submitting"
                      ? "Submitting..."
                      : "Reset"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our{" "}
        <Link to="#">Terms of Service</Link>
        and <Link to="#">Privacy Policy</Link>.
      </div>
    </div>
  );
}
