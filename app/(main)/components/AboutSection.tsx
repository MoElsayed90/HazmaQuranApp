"use client";

import { BookOpen, Headphones, GraduationCap, Bookmark, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: BookOpen,
    title: "تصفح القرآن الكريم",
    description: "اقرأ القرآن الكريم كاملاً مع الترقيم العثماني، واختر حجم الخط المناسب، واستمع إلى أي آية بأكثر من قارئ.",
  },
  {
    icon: GraduationCap,
    title: "المصحف المعلم",
    description: "مصحف الشيخ محمود خليل الحصري — عرض الآيات مع الصوت آية آية لمساعدتك على الحفظ والمراجعة.",
  },
  {
    icon: Headphones,
    title: "أشهر القراء",
    description: "استمع لتلاوات مشاري العفاسي، والحصري، والمنشاوي، وعبد الباسط، وغيرهم من خلال واجهة واحدة.",
  },
  {
    icon: Bookmark,
    title: "المحفوظات",
    description: "احفظ مواضع الآيات المفضلة لديك وارجع إليها بسرعة من أي جهاز.",
  },
  {
    icon: Smartphone,
    title: "تجربة على كل الأجهزة",
    description: "واجهة بسيطة وواضحة تعمل على الجوال والحاسوب مع دعم الوضع الفاتح والداكن.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function AboutSection() {
  return (
    <section className="py-16 md:py-20 bg-muted/20 border-y border-border/50">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4"
        >
          ما هو تطبيق حمزة؟
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-base md:text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          حمزة تطبيق قرآن كريم يجمع بين القراءة والاستماع والحفظ. تصفح القرآن الكريم، استمع لأشهر القراء،
          واستخدم المصحف المعلم للشيخ الحصري لربط الصوت بالنص أثناء الحفظ.
          <span className="block mt-2 text-sm text-muted-foreground/80">نسخة تجريبية — نرحب بملاحظاتكم.</span>
        </motion.p>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              transition={{ duration: 0.4 }}
              className="rounded-xl border bg-card p-6 text-right hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">{title}</h3>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
