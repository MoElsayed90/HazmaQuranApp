import { notFound } from "next/navigation";
import { MushafPageClient } from "./MushafPageClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `المصحف — صفحة ${page}`,
    description: "قراءة المصحف الشريف",
  };
}

export default async function MushafPageRoute({ params }: PageProps) {
  const { page } = await params;
  const pageNum = Number(page);
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
    notFound();
  }
  return <MushafPageClient pageNumber={pageNum} />;
}
