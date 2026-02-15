"use client";

import { Moon, Sun, Monitor, Type, BookOpenText, Trash2, Info, Mic2, Download } from "lucide-react";
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
import { AUDIO_EDITIONS, type AudioEditionId } from "@/lib/audio/service";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const fontSizeKeys = Object.keys(FONT_SIZES) as Array<keyof typeof FONT_SIZES>;
const audioEditionIds = Object.keys(AUDIO_EDITIONS) as AudioEditionId[];

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize, showTranslation, setShowTranslation, audioEdition, setAudioEdition } =
    useSettingsStore();
  const { bookmarks, clearAll } = useBookmarkStore();
  const { canInstall, install } = usePWAInstall();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleInstallApp = async () => {
    const ok = await install();
    if (ok) toast.success("جاري تثبيت التطبيق");
  };

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
            التفسير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">عرض التفسير الميسر</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                يظهر تحت كل آية أثناء القراءة
              </p>
            </div>
            <Switch
              checked={showTranslation}
              onCheckedChange={setShowTranslation}
            />
          </div>
        </CardContent>
      </Card>

      {/* صوت التلاوة — قارئ السور (يشمل المصحف المعلم للشيخ الحصري) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mic2 className="h-4 w-4" />
            صوت التلاوة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">قارئ الصوت أثناء قراءة السور</p>
            <p className="text-xs text-muted-foreground">
              يشمل خيار المصحف المعلم للشيخ محمود خليل الحصري
            </p>
            <Select
              value={audioEditionIds.includes(audioEdition as AudioEditionId) ? audioEdition : "alafasy"}
              onValueChange={(v) => setAudioEdition(v)}
            >
              <SelectTrigger className="w-full max-w-xs mt-2" dir="rtl">
                <SelectValue placeholder="اختر القارئ" />
              </SelectTrigger>
              <SelectContent>
                {audioEditionIds.map((id) => (
                  <SelectItem key={id} value={id} className="text-right">
                    {AUDIO_EDITIONS[id].name}
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

      {/* تثبيت التطبيق (PWA) — يظهر عندما يدعم المتصفح التثبيت */}
      {canInstall && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" />
              تثبيت التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              ثبّت حمزة على جهازك لاستخدامه كتطبيق وتشغيله من الشاشة الرئيسية.
            </p>
            <Button className="gap-2" onClick={handleInstallApp}>
              <Download className="h-4 w-4" />
              تنزيل / تثبيت التطبيق
            </Button>
          </CardContent>
        </Card>
      )}

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
            بيانات القرآن من{" "}
            <a
              href="https://alquran.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              AlQuran Cloud
            </a>
          </p>
          <p>
            بيانات القراء من{" "}
            <a
              href="https://islamhouse.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              IslamHouse
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
