import { Sparkles, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import type { Trend } from "@shared/schema";

export default function TrendsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });

  const { data: trends = [], isLoading } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
  });

  const trendsByCategory = useMemo(() => {
    const grouped: Record<string, Trend[]> = {};
    trends.forEach(trend => {
      if (!grouped[trend.category]) {
        grouped[trend.category] = [];
      }
      grouped[trend.category].push(trend);
    });
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.order.localeCompare(b.order));
    });
    return grouped;
  }, [trends]);

  const categories = Object.keys(trendsByCategory).sort();

  if (isLoading) {
    return (
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-muted-foreground">იტვირთება ტრენდები...</p>
        </div>
      </section>
    );
  }

  if (trends.length === 0) {
    return null; // Don't show section if no trends
  }

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-theme-accent" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">
              რა არის ახლა ტრენდში
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            What's Trendy Now
          </p>
        </motion.div>

        {/* Trends by Category */}
        <div className="space-y-20">
          {categories.map((category, categoryIndex) => (
            <div key={category}>
              <motion.h3
                className="font-display text-2xl md:text-3xl mb-8 text-foreground flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              >
                <Sparkles className="w-6 h-6 text-theme-accent" />
                {category}
              </motion.h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trendsByCategory[category].map((trend, index) => (
                  <motion.div
                    key={trend.id}
                    className="group relative bg-card border-2 rounded-xl overflow-hidden hover-elevate active-elevate-2"
                    style={{ borderColor: '#B76E7933' }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{
                      duration: 0.6,
                      delay: categoryIndex * 0.1 + index * 0.08,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    data-testid={`trend-card-${trend.id}`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={trend.imageUrl}
                        alt={trend.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h4 className="font-display text-xl mb-3 text-foreground group-hover:text-theme-accent transition-colors duration-300">
                        {trend.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {trend.description}
                      </p>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-theme-accent/20 backdrop-blur-sm rounded-full p-2">
                        <Sparkles className="w-4 h-4 text-theme-accent" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
