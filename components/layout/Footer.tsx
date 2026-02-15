"use client";

import Link from "next/link";
import { MessageCircle, Linkedin, BookOpen, Mic2, GraduationCap, Bookmark } from "lucide-react";

const WHATSAPP_NUMBER = "201270135135";
const LINKEDIN_URL = "https://www.linkedin.com/in/mohamed-elsayedmc";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          {/* التطبيق */}
          <div>
            <h3 className="font-semibold text-base text-foreground mb-2">حمزة</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              تطبيق القرآن الكريم — تصفح السور، استمع لأشهر القراء، واستخدم المصحف المعلم للحفظ.
            </p>
          </div>

          {/* روابط سريعة */}
          <div>
            <h3 className="font-semibold text-base text-foreground mb-2">روابط سريعة</h3>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/surahs" className="hover:text-foreground transition-colors flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  السور
                </Link>
              </li>
              <li>
                <Link href="/teacher-mushaf" className="hover:text-foreground transition-colors flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  المصحف المعلم
                </Link>
              </li>
              <li>
                <Link href="/reciters" className="hover:text-foreground transition-colors flex items-center gap-2">
                  <Mic2 className="h-4 w-4" />
                  القراء
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-foreground transition-colors flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  المحفوظات
                </Link>
              </li>
            </ul>
          </div>

          {/* تواصل مع المطور — أيقونات فقط */}
          <div>
            <h3 className="font-semibold text-base text-foreground mb-2">تواصل مع المطور</h3>
            <p className="text-muted-foreground text-sm mb-3">محمد السيد — مطور التطبيق</p>
            <div className="flex gap-2">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="واتساب"
                title="واتساب 01270135135"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="Mohamed Elsayed على LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A66C2]/15 text-[#0A66C2] hover:bg-[#0A66C2]/25 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* المصادر */}
          <div>
            <h3 className="font-semibold text-base text-foreground mb-2">المصادر</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
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

        <div className="mt-8 pt-5 border-t text-center text-muted-foreground/80 text-sm">
          <p>© {new Date().getFullYear()} حمزة — تطبيق القرآن الكريم. Developed by Eng. Mohamed Elsayed.</p>
        </div>
      </div>
    </footer>
  );
}
