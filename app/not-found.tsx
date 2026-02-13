import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <BookOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground mb-8">
        الصفحة التي تبحث عنها غير موجودة
      </p>
      <Link href="/">
        <Button className="gap-2">
          <BookOpen className="h-4 w-4" />
          العودة للرئيسية
        </Button>
      </Link>
    </div>
  );
}
