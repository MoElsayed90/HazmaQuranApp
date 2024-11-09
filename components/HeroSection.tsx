import Image from "next/image";
import { Button } from "@/components/ui/button";
import hero  from "@/public/1.png";

const HeroSection = () => {
  return (
    <div className="w-full relative">
    <Image src={hero} alt={""} className="w-full h-[38rem]" />
    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex flex-col items-center justify-center">
      <h1 className="text-neutral-200  text-4xl md:text-6xl font-bold text-center">
        استمع إلى القرآن الكريم
      </h1>
      <p className="text-neutral-200 text-2xl md:text-2xl font-bold text-center py-8">
        استمتع بتلاوة القرآن الكريم بصوت مجموعة من أشهر القراء. واجهة سهلة
        .الاستخدام وخيارات صوت متعددة تناسب احتياجاتك
      </p>
      <Button size={"lg"} className="rounded-lg bg-white hover:text-white">
        أستمع الآن
      </Button>
    </div>
  </div>
  )

}

export default HeroSection;