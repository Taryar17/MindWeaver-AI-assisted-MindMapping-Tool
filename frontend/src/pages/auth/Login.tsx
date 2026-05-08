import { Link } from "react-router-dom";
import { Icons } from "@/components/icons";
import BannerLogo from "@/data/images/logo.png";
import LoginForm from "@/components/auth/LoginForm";

function Login() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Link
        to="/"
        className="fixed left-8 top-6 z-50 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground/90 transition-colors hover:text-primary"
      >
        <Icons.logo className="size-12 text-primary" />
        <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          Mind Weaver
        </span>
      </Link>

      <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-background">
        <div className="flex w-full items-center justify-center px-8 relative z-10">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>

        <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
          {/* Subtle Animated Background Radial */}
          <div className="absolute inset-0 bg-gradient-to-r via-transparent to-transparent" />

          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/60 opacity-20 blur-2xl group-hover:opacity-40 transition duration-1000"></div>
            <img
              src={BannerLogo}
              alt="MindWeaver AI"
              className="relative w-full max-w-lg opacity-90"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
