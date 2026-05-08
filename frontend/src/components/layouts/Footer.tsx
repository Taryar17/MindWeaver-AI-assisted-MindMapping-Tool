import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { Icons } from "@/components/icons";
import NewsLetterForm from "@/components/news-letter";

function Footer() {
  return (
    <footer className="border-t border-border bg-background/40 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <Link
              to="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <Icons.logo className="size-6 text-primary" />
              <span className="text-foreground">{siteConfig.name}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Visual thinking made simple. Organize ideas and build mind maps
              effortlessly.
            </p>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {siteConfig.footerNav.map((foot) => (
              <div key={foot.title} className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground/80">
                  {foot.title}
                </h4>
                <ul className="space-y-2">
                  {foot.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        to={item.href}
                        target={item.external ? "_blank" : undefined}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="space-y-3 max-w-xs">
            <h4 className="text-sm font-semibold text-foreground/80">
              Subscribe to our newsletter
            </h4>
            <p className="text-xs text-muted-foreground">
              Get updates about new features and improvements.
            </p>
            <NewsLetterForm />
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-4">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-primary">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
