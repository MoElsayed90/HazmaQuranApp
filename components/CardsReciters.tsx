"use client";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

interface CardProps {
  id: number;
  title: string;
  recitations_ids: number[];
}

const reciterImages: { [key: number]: string } = {
  135998: "/elhosry.png",
  167521: "/ali-banaa.png",
  8326: "/Mashari.png",
  8474: "/sodisy.png",
  86335: "/m3qly.png",
  111670: "/mohamed-seddik-el-menchaoui.png",
  111542: "/ABDElBASET.png",
  151567: "/Dosari.png",
};

const CardsReciters = ({ reciters }: { reciters: CardProps[] }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true }); // Trigger only once

  return (
    <div className="px-10" ref={ref}>
      <motion.h1
        className="text-primary text-4xl md:text-6xl font-bold text-center mb-10"
        initial={{ opacity: 0, y: -50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}} // Animate only once when in view
        transition={{ duration: 1 }}
      >
        أشهر القراء بالوطن العربى
      </motion.h1>

      <div className="grid md:grid-cols-4 grid-cols-1 gap-4 place-items-center md:mx-16">
        {reciters.map((reciter) => (
          <Link
            href={`/reciter/${reciter.id}?recitations=${reciter.recitations_ids.join(",")}`}
            key={reciter.id}
          >
            <motion.div
              className="card bg-accent shadow-xl cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}} // Animate only once
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <figure className="h-72">
                <Image
                  src={reciterImages[reciter.id] || "/default-image.jpg"}
                  alt={reciter.title}
                  width={320}
                  height={240}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </figure>
              <div className="card-body p-4">
                <h2 className="card-title self-center text-sm">{reciter.title}</h2>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CardsReciters;