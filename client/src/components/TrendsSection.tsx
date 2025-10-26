import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRef } from "react";
import type { Trend, TrendsSection as TrendsSectionType } from "@shared/schema";

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

  return (
    <section ref={sectionRef} className="py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Minimal Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-theme-accent" />
            <h2 className="font-display text-2xl md:text-3xl text-foreground">
              {sectionData?.title || "რა არის ახლა ტრენდში"}
            </h2>
          </div>
          {sectionData?.subtitle && (
            <p className="text-sm text-muted-foreground">
              {sectionData.subtitle}
            </p>
          )}
        </motion.div>

        {/* Modern Lookbook Grid - Pinterest/Mood Board Style */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {sortedTrends.map((trend, index) => (
            <motion.div
              key={trend.id}
              className="break-inside-avoid mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              data-testid={`trend-card-${trend.id}`}
            >
              <div className="group relative rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-xl transition-all duration-500">
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={trend.imageUrl}
                    alt={trend.title}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Minimal Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm font-medium">
                        {trend.title}
                      </p>
                      {trend.description && (
                        <p className="text-white/80 text-xs mt-1 line-clamp-2">
                          {trend.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Optional: Simple text note at bottom */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Inspiration & Trends
        </motion.p>
      </div>
    </section>
  );
}
