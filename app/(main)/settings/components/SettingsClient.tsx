"use client";

import {
  Moon,
  Sun,
  Monitor,
  Type,
  BookOpenText,
  Trash2,
  Info,
  Mic2,
  Download,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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

const THEME_OPTIONS = [
  { value: "light", label: "فاتح", icon: Sun },
  { value: "dark", label: "داكن", icon: Moon },
  { value: "system", label: "تلقائي", icon: Monitor },
] as const;

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/60 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const {
    fontSize,
    setFontSize,
    showTranslation,
    setShowTranslation,
    audioEdition,
    setAudioEdition,
  } = useSettingsStore();
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
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          الإعدادات
        </h1>
        <p className="text-muted-foreground text-base">
          تخصيص القراءة والصوت والمظهر
        </p>
      </header>

      {/* القراءة والمظهر */}
      <SettingsSection title="القراءة والمظهر">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Theme - segment control */}
          <Card className="rounded-xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sun className="h-4 w-4 text-primary/80" />
                المظهر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {mounted && (
                <div className="flex rounded-lg border border-border bg-muted/30 p-0.5 overflow-hidden">
                  {THEME_OPTIONS.map(({ value, label, icon: Icon }, i) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 h-11 text-sm font-medium transition-colors",
                        i === 0 && "rounded-r-lg",
                        i === THEME_OPTIONS.length - 1 && "rounded-l-lg",
                        theme === value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-background/50"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Font size */}
          <Card className="rounded-xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="h-4 w-4 text-primary/80" />
                حجم الخط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <Slider
                value={[fontSizeIndex]}
                max={fontSizeKeys.length - 1}
                step={1}
                onValueChange={(val) => setFontSize(fontSizeKeys[val[0]])}
              />
              <div className="flex flex-wrap justify-between gap-x-1 gap-y-0.5 text-xs text-muted-foreground">
                {fontSizeKeys.map((key) => (
                  <span
                    key={key}
                    className={cn(
                      fontSize === key && "text-primary font-medium"
                    )}
                  >
                    {FONT_SIZES[key].label}
                  </span>
                ))}
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">معاينة</p>
                <div className="rounded-xl bg-muted/40 dark:bg-muted/20 p-4 border border-border/50">
                  <p className="quran-text text-center break-words min-w-0">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Translation - full width on this row when 2 cols */}
          <Card className="rounded-xl border-border/80 shadow-sm overflow-hidden lg:col-span-2">
            <CardContent className="py-5">
              <div className="flex items-center justify-between gap-6">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium">عرض التفسير الميسر</p>
                  <p className="text-xs text-muted-foreground">
                    يظهر تحت كل آية أثناء القراءة
                  </p>
                </div>
                <Switch
                  checked={showTranslation}
                  onCheckedChange={setShowTranslation}
                  className="shrink-0"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </SettingsSection>

      {/* الصوت */}
      <SettingsSection title="الصوت">
        <Card className="rounded-xl border-border/80 shadow-sm overflow-hidden max-w-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Mic2 className="h-4 w-4 text-primary/80" />
              صوت التلاوة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-muted-foreground">
              قارئ الصوت أثناء قراءة القرآن. يشمل خيار المصحف المعلم للشيخ
              محمود خليل الحصري.
            </p>
            <Select
              value={
                audioEditionIds.includes(audioEdition as AudioEditionId)
                  ? audioEdition
                  : "alafasy"
              }
              onValueChange={(v) => setAudioEdition(v)}
            >
              <SelectTrigger className="w-full text-right" dir="rtl">
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
          </CardContent>
        </Card>
      </SettingsSection>

      {/* التطبيق */}
      <SettingsSection title="التطبيق">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Data */}
          <Card className="rounded-xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-primary/80" />
                البيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium">حذف الإشارات المرجعية</p>
                  <p className="text-xs text-muted-foreground">
                    {bookmarks.length} إشارة محفوظة
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    لا يمكن التراجع عن الحذف.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="shrink-0 w-full sm:w-auto"
                  onClick={handleClearBookmarks}
                >
                  حذف الكل
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PWA */}
          {canInstall && (
            <Card className="rounded-xl border-border/80 shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary/80" />
                  تثبيت التطبيق
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <p className="text-sm text-muted-foreground">
                  ثبّت حمزة على جهازك لاستخدامه كتطبيق وتشغيله من الشاشة
                  الرئيسية.
                </p>
                <Button
                  className="gap-2 w-full sm:w-auto"
                  onClick={handleInstallApp}
                >
                  <Download className="h-4 w-4" />
                  تنزيل / تثبيت التطبيق
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SettingsSection>

      {/* حول التطبيق - compact full width */}
      <section className="pt-4 border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              حمزة — تطبيق القرآن الكريم
            </p>
            <p className="text-xs text-muted-foreground">الإصدار 1.0.0</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a
              href="https://alquran.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              AlQuran Cloud
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-muted-foreground/50" aria-hidden>
              •
            </span>
            <a
              href="https://islamhouse.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              IslamHouse
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Developed by Eng. Mohamed Elsayed
        </p>
      </section>
    </div>
  );
}
