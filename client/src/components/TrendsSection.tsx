import { Sparkles, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRef } from "react";
import type { Trend } from "@shared/schema";

export default function TrendsSection() {
  const sectionRef = useRef(null);

  const { data: trends = [], isLoading } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
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
    <section ref={sectionRef} className="py-12 lg:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Compact Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="w-6 h-6 text-theme-accent" />
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground">
              რა არის ახლა ტრენდში
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            What's Trendy Now
          </p>
        </motion.div>

        {/* Single Compact Block with Images Grid and Text */}
        <motion.div
          className="bg-card border border-border rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4">
            {sortedTrends.map((trend, index) => (
              <motion.div
                key={trend.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                data-testid={`trend-image-${trend.id}`}
              >
                <img
                  src={trend.imageUrl}
                  alt={trend.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Hover Overlay with Title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <p className="text-white text-xs font-medium line-clamp-2">
                    {trend.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Text Content Block */}
          <div className="px-6 pb-6 space-y-4">
            {sortedTrends.map((trend, index) => (
              <motion.div
                key={`text-${trend.id}`}
                className="border-l-2 border-theme-accent pl-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                data-testid={`trend-text-${trend.id}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-theme-accent" />
                  <h3 className="font-display text-base md:text-lg text-foreground">
                    {trend.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {trend.description}
                </p>
                {trend.category && (
                  <span className="inline-block mt-2 text-xs text-theme-accent font-medium">
                    {trend.category}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
