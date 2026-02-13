"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, BookOpen, Mic2, Bookmark, Home, Settings } from "lucide-react";
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
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
  Home,
  BookOpen,
  Mic2,
  Bookmark,
};

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">
            حمزة
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = iconMap[link.icon];
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          <Link href="/surahs">
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="بحث">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/settings" className="hidden sm:inline-flex">
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="الإعدادات">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          <ThemeToggle />

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
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
                        className={cn(
                          "w-full justify-start gap-3 text-base",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
                <Link href="/settings" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-base">
                    <Settings className="h-5 w-5" />
                    الإعدادات
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
