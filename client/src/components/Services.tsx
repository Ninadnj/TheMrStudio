import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import type { ServicesSection } from "@shared/schema";

export default function Services() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const { data: servicesSection } = useQuery<ServicesSection>({
    queryKey: ["/api/services-section"],
  });

  const categoryDescriptions: Record<string, string> = servicesSection
    ? JSON.parse(servicesSection.categoryDescriptions)
    : {};

  const categories = ["მანიკური / პედიკური", "ლაზერული ეპილაცია", "კოსმეტოლოგია"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 40,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section id="services" className="py-24 lg:py-40 bg-background" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 text-foreground">
            {servicesSection?.title || "ჩვენი სერვისები"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {servicesSection?.subtitle || "Our Services"}
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {categories.map((category, categoryIndex) => {
            return (
              <motion.div
                key={category}
                variants={cardVariants}
                whileHover={{ 
                  y: -8,
                  scale: 1.03,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                data-testid={`category-${category}`}
              >
                <div className="group border border-border/50 rounded-xl bg-card/40 backdrop-blur-sm p-12 h-full cursor-pointer overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-theme-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex flex-col items-center text-center">
                    <h3 className="font-display text-2xl md:text-3xl text-foreground mb-6 tracking-tight">
                      {category}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {categoryDescriptions[category] || ""}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
