"use client";

import Link from "next/link";
import { MessageCircle, Linkedin, BookOpen, Mic2, GraduationCap, Bookmark, Home } from "lucide-react";

const WHATSAPP_NUMBER = "201270135135";
const LINKEDIN_URL = "https://www.linkedin.com/in/mohamed-elsayedmc";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-primary/10 bg-background/70 backdrop-blur-md">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          {/* التطبيق */}
          <div>
            <h3 className="font-semibold text-base text-foreground mb-3">حمزة</h3>
            <p className="text-muted-foreground leading-relaxed text-sm max-w-xs">
              تطبيق القرآن الكريم — تصفح القرآن الكريم، استمع لأشهر القراء، واستخدم المصحف المعلم للحفظ.
            </p>
          </div>

          {/* روابط سريعة */}
          <div>
            <h3 className="font-semibold text-base text-foreground mb-3">روابط سريعة</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2 rounded-md py-1 -mx-1 px-1 w-fit">
                  <Home className="h-4 w-4 shrink-0 text-primary/80" />
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/surahs" className="hover:text-primary transition-colors flex items-center gap-2 rounded-md py-1 -mx-1 px-1 w-fit">
                  <BookOpen className="h-4 w-4 shrink-0 text-primary/80" />
                  القرآن الكريم
                </Link>
              </li>
              <li>
                <Link href="/teacher-mushaf" className="hover:text-primary transition-colors flex items-center gap-2 rounded-md py-1 -mx-1 px-1 w-fit">
                  <GraduationCap className="h-4 w-4 shrink-0 text-primary/80" />
                  المصحف المعلم
                </Link>
              </li>
              <li>
                <Link href="/reciters" className="hover:text-primary transition-colors flex items-center gap-2 rounded-md py-1 -mx-1 px-1 w-fit">
                  <Mic2 className="h-4 w-4 shrink-0 text-primary/80" />
                  القراء
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-primary transition-colors flex items-center gap-2 rounded-md py-1 -mx-1 px-1 w-fit">
                  <Bookmark className="h-4 w-4 shrink-0 text-primary/80" />
                  المحفوظات
                </Link>
              </li>
            </ul>
          </div>

          {/* تواصل مع المطور */}
          <div>
            <h3 className="font-semibold text-base text-foreground mb-3">تواصل مع المطور</h3>
            <p className="text-muted-foreground text-sm mb-4">محمد السيد — مطور التطبيق</p>
            <div className="flex gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="واتساب"
                title="واتساب 01270135135"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 hover:scale-105 transition-all"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="Mohamed Elsayed على LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A66C2]/15 text-[#0A66C2] hover:bg-[#0A66C2]/25 hover:scale-105 transition-all"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* المصادر */}
          <div>
            <h3 className="font-semibold text-base text-foreground mb-3">المصادر</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              بيانات القرآن من{" "}
              <a href="https://alquran.cloud" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                AlQuran Cloud
              </a>
              ، وبيانات القراء من{" "}
              <a href="https://islamhouse.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                IslamHouse
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary/10 text-center text-muted-foreground/90 text-sm px-2">
          <p className="break-words">© {new Date().getFullYear()} حمزة — تطبيق القرآن الكريم. Developed by Eng. Mohamed Elsayed.</p>
        </div>
      </div>
    </footer>
  );
}
