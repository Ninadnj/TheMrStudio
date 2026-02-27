import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import type { ServicesSection } from "@shared/schema";

export default function Services() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const { data: servicesSection } = useQuery<ServicesSection>({
    queryKey: ["/api/services-section"],
  });

  const categoryDescriptions: Record<string, string> = servicesSection
    ? JSON.parse(servicesSection.categoryDescriptions)
    : {};

  const services = [
    {
      id: "nails",
      title: "ფრჩხილები",
      scents: "მანიკური / პედიკური",
      image: "/assets/services/nails.png",
      description: "პრემიუმ მასალებით შესრულებული ექსკლუზიური ფრჩხილის ესთეტიკა."
    },
    {
      id: "laser",
      title: "ლაზერი",
      scents: "ლაზერული ეპილაცია",
      image: "/assets/services/laser.png",
      description: "უახლესი დიოდური ლაზერული ტექნოლოგია."
    },
    {
      id: "cosmetology",
      title: "ესთეტიკა",
      scents: "კოსმეტოლოგია",
      image: "/assets/services/cosmetology.png",
      description: "სახის მოწინავე პროცედურები და ინექციები."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section id="services" className="py-24 md:py-36 bg-[#09090b] relative overflow-hidden" ref={sectionRef}>
      <div className="max-w-[100rem] mx-auto px-6 md:px-12">
        <motion.div
          className="mb-16 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-6 mb-6">
            <span className="text-[10px] text-[var(--theme-accent)] tracking-[0.3em] uppercase font-mono border border-[var(--theme-accent)]/30 px-3 py-1">
              ჩვენი სერვისები
            </span>
          </div>
          <h2 className="font-display text-5xl md:text-7xl lg:text-[6vw] leading-[0.9] text-[#fafafa] tracking-tighter uppercase">
            ჩვენი სერვისები
          </h2>
        </motion.div>

        <motion.div
          className="flex flex-col border-t border-[var(--theme-accent)]/30 mt-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={cardVariants}
              className="group relative border-b border-[var(--theme-accent)]/30 py-10 md:py-16 flex flex-col justify-center cursor-pointer overflow-hidden bg-[#09090b] hover:bg-[#fafafa] transition-colors duration-500"
            >
              <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between w-full px-4 md:px-8 pointer-events-none mix-blend-difference">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                  <span className="font-mono text-xs text-[var(--theme-accent)] group-hover:text-[#FAFAFA] transition-colors duration-500 hidden md:block">
                    0{index + 1}
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-[#fafafa] group-hover:text-[#09090b] transition-colors duration-500 uppercase tracking-tighter">
                    {service.title}
                  </h3>
                </div>
                <div className="mt-6 md:mt-0 flex flex-col items-start md:items-end text-left md:text-right mix-blend-normal">
                  <p className="font-mono text-xs md:text-sm text-[#fafafa]/50 group-hover:text-[#09090b]/50 transition-colors duration-500 uppercase tracking-widest mb-2">
                    {service.scents}
                  </p>
                  <p className="font-sans text-sm text-[#fafafa]/40 group-hover:text-[#09090b]/60 transition-colors duration-500 max-w-sm hidden md:block">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Hover Image Reveal - Visible on mobile at low opacity, pops on hover/desktop */}
              <div className="absolute top-0 right-0 w-full md:w-[40%] h-full opacity-25 md:opacity-30 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/70 md:via-[#09090b]/50 to-transparent group-hover:from-[#fafafa] group-hover:via-[#fafafa]/50 transition-colors duration-500 z-10" />
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-all duration-700 opacity-60 md:opacity-80 group-hover:opacity-100"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
