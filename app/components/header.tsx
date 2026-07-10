import { Menu, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/components/i18n-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppLogo } from "./app-logo";

const desktopNavLinkClass = cn(
  "rounded-md px-3 py-2 font-medium text-muted-foreground text-sm transition-colors",
  "hover:bg-card hover:text-primary",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
);

const mobileNavLinkClass = cn(
  "rounded-md px-4 py-3 text-left font-medium text-muted-foreground transition-colors",
  "hover:bg-card hover:text-primary",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
);

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 border-b transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "bg-background shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          : "/60 bg-background"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between text-foreground">
          {/* Left: Logo & Site Name */}
          <AppLogo />

          {/* Center: Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/showcase" className={desktopNavLinkClass}>
              {t("header.showcase")}
            </Link>
            <Link to="/guide" className={desktopNavLinkClass}>
              {t("header.guide", "Guide")}
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="hidden items-center gap-4 md:flex">
            <Button
              size="sm"
              asChild
              className="rounded-md border border-primary/60 bg-card font-semibold text-primary shadow-[0_0_20px_rgba(0,217,146,0.12)] hover:bg-black/20 hover:text-primary"
            >
              <Link to="/#workspace">{t("header.startGenerating")}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={
                isMobileMenuOpen
                  ? t("header.closeMobileMenu", "Close navigation menu")
                  : t("header.openMobileMenu", "Open navigation menu")
              }
              className="rounded-md p-2 text-muted-foreground hover:bg-card hover:text-primary focus:outline-none"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="slide-in-from-top-5 absolute top-16 right-0 left-0 flex animate-in flex-col gap-4 border-b bg-background p-4 shadow-[0_20px_60px_rgba(0,0,0,0.7)] duration-200 md:hidden">
          <Link to="/showcase" className={mobileNavLinkClass}>
            {t("header.showcase")}
          </Link>
          <Link to="/guide" className={mobileNavLinkClass}>
            {t("header.guide", "Guide")}
          </Link>

          <div className="mt-4 flex flex-col gap-3 border-t pt-4">
            <Button
              asChild
              className="rounded-md border border-primary/60 bg-card font-semibold text-primary hover:bg-black/20 hover:text-primary"
            >
              <Link to="/#workspace">{t("header.startGenerating")}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
