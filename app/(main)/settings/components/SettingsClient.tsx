"use client";

import { Moon, Sun, Monitor, Type, BookOpenText, Trash2, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsStore } from "@/lib/stores/use-settings";
import { useBookmarkStore } from "@/lib/stores/use-bookmarks";
import { FONT_SIZES } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const fontSizeKeys = Object.keys(FONT_SIZES) as Array<keyof typeof FONT_SIZES>;

const FALLBACK_TRANSLATIONS = [
  { id: 57, name: "التفسير الميسر", slug: "ar.muyassar", languageName: "arabic" },
  { id: 131, name: "Clear Quran (English)", slug: "en.clearcoran", languageName: "english" },
  { id: 20, name: "Sahih International (English)", slug: "en.sahih", languageName: "english" },
];

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize, showTranslation, setShowTranslation, translationEdition, setTranslationEdition } =
    useSettingsStore();
  const { bookmarks, clearAll } = useBookmarkStore();
  const [mounted, setMounted] = useState(false);
  const [translations, setTranslations] = useState<Array<{ id: number; name: string; slug: string; languageName: string }>>(FALLBACK_TRANSLATIONS);

  const translationOptions = translations.some((t) => t.slug === translationEdition)
    ? translations
    : [...translations, { id: 0, name: translationEdition || "—", slug: translationEdition || "", languageName: "" }];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetch("/api/translations")
      .then((r) => r.ok ? r.json() : { translations: [] })
      .then((data: { translations?: Array<{ id: number; name: string; slug: string; languageName: string }> }) => {
        const list = data.translations && data.translations.length > 0 ? data.translations : FALLBACK_TRANSLATIONS;
        setTranslations(list);
      })
      .catch(() => {});
  }, []);

  const fontSizeIndex = fontSizeKeys.indexOf(fontSize);

  const handleClearBookmarks = () => {
    if (bookmarks.length === 0) {
      toast("لا توجد إشارات مرجعية للحذف");
      return;
    }
    clearAll();
    toast.success("تم حذف جميع الإشارات المرجعية");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="h-4 w-4" />
            المظهر
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mounted && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "light", label: "فاتح", icon: Sun },
                { value: "dark", label: "داكن", icon: Moon },
                { value: "system", label: "تلقائي", icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={theme === value ? "default" : "outline"}
                  className={cn(
                    "gap-2 h-12",
                    theme === value && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setTheme(value)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Font size */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="h-4 w-4" />
            حجم الخط
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={[fontSizeIndex]}
            max={fontSizeKeys.length - 1}
            step={1}
            onValueChange={(val) => setFontSize(fontSizeKeys[val[0]])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {fontSizeKeys.map((key) => (
              <span
                key={key}
                className={cn(fontSize === key && "text-primary font-medium")}
              >
                {FONT_SIZES[key].label}
              </span>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <p className="quran-text text-center">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Translation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpenText className="h-4 w-4" />
            الترجمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">عرض الترجمة تحت الآية</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                يظهر تحت كل آية أثناء القراءة
              </p>
            </div>
            <Switch
              checked={showTranslation}
              onCheckedChange={setShowTranslation}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">اختر مصدر الترجمة</p>
            <Select value={translationEdition || ""} onValueChange={setTranslationEdition}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ترجمة" />
              </SelectTrigger>
              <SelectContent>
                {translationOptions.map((t) => (
                  <SelectItem key={t.slug || t.id} value={t.slug}>
                    {t.name} {t.languageName ? `(${t.languageName})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            البيانات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">حذف الإشارات المرجعية</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {bookmarks.length} إشارة محفوظة
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleClearBookmarks}
            >
              حذف الكل
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            حول التطبيق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">حمزة</span> - تطبيق
            القرآن الكريم
          </p>
          <p>الإصدار 1.0.0</p>
          <Separator className="my-3" />
          <p>
            المحتوى والقراء من{" "}
            <a
              href="https://quran.foundation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Quran.Foundation
            </a>
          </p>
          <Separator className="my-3" />
          <p className="text-muted-foreground">
            Developed by Eng. Mohamed Elsayed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
