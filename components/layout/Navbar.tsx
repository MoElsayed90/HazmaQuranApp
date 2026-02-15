"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Search, BookOpen, Mic2, Bookmark, Home, Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useState, useEffect } from "react";

const iconMap: Record<string, React.ElementType> = {
  Home,
  BookOpen,
  Mic2,
  Bookmark,
};

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { canInstall, install, isInstalled } = usePWAInstall();
  useEffect(() => setMounted(true), []);

  const logoSrc = mounted && resolvedTheme === "dark" ? "/logo_Dark.png" : "/light_logo.png";

  const handleInstallClick = async () => {
    await install();
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex md:h-24 h-16 items-center justify-between px-4">
        {/* Logo only — no duplicate text; size fits navbar */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src={logoSrc}
            alt="حمزة"
            width={200}
            height={20}
            className="h-12 w-auto object-contain md:h-20"
            priority
          />
        </Link>

        {/* Desktop Nav — compact text */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const Icon = iconMap[link.icon];
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-1.5 text-sm",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="بحث">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/settings" className="hidden sm:inline-flex">
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="الإعدادات">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          <ThemeToggle />

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
                <span className="sr-only">القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-right">القائمة</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {NAV_LINKS.map((link) => {
                  const Icon = iconMap[link.icon];
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start gap-2 text-sm",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
                <Link href="/settings" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm">
                    <Settings className="h-4 w-4" />
                    الإعدادات
                  </Button>
                </Link>
                {!isInstalled && (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full justify-start gap-2 text-sm mt-2 bg-primary"
                    onClick={handleInstallClick}
                  >
                    <Download className="h-4 w-4" />
                    تثبيت التطبيق (تنزيل)
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
