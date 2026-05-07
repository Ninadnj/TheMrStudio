import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Trend, TrendsSection as TrendsSectionType } from "@shared/schema";
import { isVideoUrl } from "@/lib/videoUtils";
import SectionHeader from "@/components/SectionHeader";
import { stripDecorativeSymbols } from "@/lib/sanitizeText";

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

        <motion.div
          className="absolute top-16 md:top-20 left-0 right-0 z-10 px-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-card/80 border border-border px-3 py-1.5 mb-4 shadow-sm">
              <TrendingUp className="w-4 h-4 text-theme-accent" />
              <span className="text-[10px] uppercase font-mono text-foreground/60">Live edit</span>
            </div>
            <SectionHeader
              kicker="02 / Trends"
              title={sectionData?.title || "What's Trending Now"}
              subtitle="Selected finishes, colors, and treatments clients are asking for now."
            />
          </div>
        </motion.div>

        <motion.div style={{ x }} className="flex gap-4 md:gap-6 px-8 md:px-20 pt-20">
          {sortedTrends.map((trend) => (
            <div
              key={trend.id}
              className="relative w-[80vw] md:w-[60vw] lg:w-[40vw] flex-shrink-0 aspect-[3/4] md:aspect-[16/9] rounded-[8px] overflow-hidden group border border-border/70 bg-card shadow-[0_28px_80px_-60px_rgba(0,0,0,0.65)]"
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
                    alt={stripDecorativeSymbols(trend.title)}
                    className={className}
                  />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/16 to-black/0 transition-colors duration-500" />

              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white font-display text-2xl md:text-4xl tracking-normal mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  {stripDecorativeSymbols(trend.title)}
                </h3>
                {trend.description && (
                  <p className="text-white/80 text-sm md:text-base max-w-md translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    {stripDecorativeSymbols(trend.description)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/55 text-xs uppercase">
          Keep Scrolling
        </div>
      </div>
    </section>
  );
}
