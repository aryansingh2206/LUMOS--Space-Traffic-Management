import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Tracker", href: "/tracker" },
  { name: "Launches", href: "/launches" },
  { name: "Alerts", href: "/alerts" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const Logo = () => (
    <Link
      to="/"
      className="flex items-center space-x-2 group"
      onClick={() => setIsOpen(false)}
    >
      <div className="text-2xl font-bold font-orbitron text-neon-blue glow-text group-hover:animate-glow-pulse">
        LUMOS
      </div>
    </Link>
  );

  const NavLinks = ({ mobile = false }) => (
    <div
      className={cn("flex gap-1", mobile ? "flex-col space-y-4" : "flex-row")}
    >
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => mobile && setIsOpen(false)}
            className={cn(
              "px-4 py-2 rounded-md font-medium transition-all duration-300",
              "hover:text-neon-blue hover:bg-neon-blue/10",
              isActive
                ? "text-neon-blue bg-neon-blue/10 glow-border"
                : "text-foreground",
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <NavLinks />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-neon-blue"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 bg-background border-l border-border"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <Logo />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="text-foreground hover:text-neon-blue"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <NavLinks mobile />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
