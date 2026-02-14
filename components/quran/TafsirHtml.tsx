"use client";

import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

interface TafsirHtmlProps {
  html: string;
  className?: string;
}

/**
 * Renders tafsir content as sanitized HTML (API returns HTML with <p>, <h2>, etc.).
 */
export function TafsirHtml({ html, className }: TafsirHtmlProps) {
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  return (
    <div
      className={cn("prose prose-sm max-w-none text-muted-foreground dark:prose-invert", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
