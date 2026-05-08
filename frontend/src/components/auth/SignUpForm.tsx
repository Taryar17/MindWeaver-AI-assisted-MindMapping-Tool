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
import { useState } from "react";

const FormSchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  email: z.string().email("Must be a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData() as { error?: string } | undefined;
  const [clientError, setClientError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    if (values.password !== values.confirmPassword) {
      setClientError("Passwords do not match.");
      return;
    }
    setClientError(null);
    submit(values, { method: "post", action: "." });
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-6 p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Link to="/" className="flex flex-col items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted border border-border group-hover:border-primary/50 transition-colors">
              <Icons.logo className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Mind Weaver
            </span>
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            autoComplete="off"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tar Yar"
                        {...field}
                        className="bg-background/50 border-input text-foreground focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Aung"
                        {...field}
                        className="bg-background/50 border-input text-foreground focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="johndoe@gmail.com"
                      {...field}
                      className="bg-background/50 border-input text-foreground focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="bg-background/50 border-input text-foreground focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="bg-background/50 border-input text-foreground focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-[10px]" />
                </FormItem>
              )}
            />

            {clientError && (
              <p className="text-xs text-destructive font-medium">
                {clientError}
              </p>
            )}
            {actionData?.error && (
              <p className="text-xs text-destructive font-medium">
                {actionData.error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-none shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.01]"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting"
                ? "Weaving your account..."
                : "Create Account"}
            </Button>
          </form>
        </Form>
      </div>

      <div className="text-balance text-center text-[10px] text-muted-foreground leading-relaxed">
        By creating an account, you agree to our{" "}
        <Link
          to="#"
          className="text-foreground/70 underline underline-offset-2 hover:text-primary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          to="#"
          className="text-foreground/70 underline underline-offset-2 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
