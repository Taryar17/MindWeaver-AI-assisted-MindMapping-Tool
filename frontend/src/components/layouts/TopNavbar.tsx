import { Icons } from "@/components/icons";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import ProgressBar from "@/components/progress-bar";

function TopNavbar() {
  return (
    <header className="w-full border-b border-border">
      <nav className="container flex h-16 items-center justify-between px-8 bg-background/40 backdrop-blur-xl">
        <ProgressBar />
        <div className="flex items-center gap-2 font-semibold">
          <Link to="/" className="flex gap-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="text-foreground">MindWeaver</span>
          </Link>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/aboutus"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            About Us
          </Link>
          <div className="h-6 w-px bg-border mx-2" />
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}

export default TopNavbar;
