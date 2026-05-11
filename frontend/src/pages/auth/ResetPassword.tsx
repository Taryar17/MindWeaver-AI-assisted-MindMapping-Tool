import { useState } from "react";
import { Link } from "react-router-dom";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { passwordApi } from "@/api/password";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await passwordApi.forgotPassword({ email });
      setIsSent(true);
      toast.success("Reset link sent to your email!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">
              MindWeaver
            </span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          {!isSent ? (
            <>
              <h1 className="text-2xl font-semibold text-foreground text-center mb-2">
                Reset Password
              </h1>
              <p className="text-muted-foreground text-center text-sm mb-6">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-background"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Back to Login
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Check Your Email
              </h2>
              <p className="text-muted-foreground mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Button
                onClick={() => (window.location.href = "/login")}
                className="bg-primary hover:bg-primary/90"
              >
                Return to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
