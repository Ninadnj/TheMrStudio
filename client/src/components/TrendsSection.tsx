import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Trend, TrendsSection as TrendsSectionType } from "@shared/schema";
import { isVideoUrl } from "@/lib/videoUtils";

export default function TrendsSection() {
  const sectionRef = useRef(null);

  const { data: trends = [], isLoading } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
  });

  const { data: sectionData } = useQuery<TrendsSectionType>({
    queryKey: ["/api/trends-section"],
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-muted-foreground">იტვირთება ტრენდები...</p>
        </div>
      </section>
    );
  }

  if (trends.length === 0) {
    return null; // Don't show section if no trends
  }

  // Sort trends by order
  const sortedTrends = [...trends].sort((a, b) => a.order.localeCompare(b.order));

  // Horizontal Scroll Logic
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0.1, 0.9], ["25%", "-75%"]);

  return (
    <section ref={sectionRef} className="h-[300vh] relative bg-background">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">

        {/* Header */}
        <motion.div
          className="absolute top-12 left-0 right-0 z-10 text-center px-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-theme-accent" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">
              {sectionData?.title || "What's Trending Now"}
            </h2>
          </div>
        </motion.div>

        {/* Horizontal Film Strip */}
        <motion.div style={{ x }} className="flex gap-8 px-20">
          {sortedTrends.map((trend) => (
            <div
              key={trend.id}
              className="relative w-[80vw] md:w-[60vw] lg:w-[40vw] flex-shrink-0 aspect-[3/4] md:aspect-[16/9] rounded-lg overflow-hidden group"
            >
              {(() => {
                const isVideo = isVideoUrl(trend.imageUrl);
                const className = "w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105";
                return isVideo ? (
                  <video
                    src={trend.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={className}
                  />
                ) : (
                  <img
                    src={trend.imageUrl}
                    alt={trend.title}
                    className={className}
                  />
                );
              })()}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white font-display text-2xl md:text-4xl mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  {trend.title}
                </h3>
                {trend.description && (
                  <p className="text-white/80 text-sm md:text-base max-w-md translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    {trend.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/50 text-xs tracking-widest uppercase">
          Keep Scrolling
        </div>
      </div>
    </section>
  );
}
