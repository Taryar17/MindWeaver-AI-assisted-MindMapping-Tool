import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Field, FieldDescription, FieldGroup } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import {
  Link,
  useSubmit,
  useNavigation,
  useActionData,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginForm() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData = useActionData() as {
    error?: string;
    message?: string;
  };

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    submit(values, { method: "post", action: "/login" });
  }
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight text-card-foreground">
            Welcome back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your mind maps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
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
                        <FormLabel className="text-foreground/80">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                            placeholder="name@example.com"
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-foreground/80">
                            Password
                          </FormLabel>
                          <Link
                            to="/reset"
                            className="text-xs text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                          >
                            Forgot Password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            className="bg-background/50 border-input text-foreground focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  {actionData?.error && (
                    <p className="text-xs text-destructive">
                      {actionData.error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-none shadow-lg shadow-primary/20 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {isSubmitting ? "Syncing..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </Field>
            <p className="text-center text-sm text-muted-foreground">
              New to Mind Weaver?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-primary/80 hover:underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </FieldGroup>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a href="#" className="text-foreground/70 hover:text-foreground">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-foreground/70 hover:text-foreground">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
