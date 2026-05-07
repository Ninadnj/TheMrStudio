import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { stripDecorativeSymbols } from "@/lib/sanitizeText";

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  /** Deprecated — kept for backward compat. Dark sections now scope `dark` themselves. */
  light?: boolean;
};

export default function SectionHeader({
  kicker,
  title,
  subtitle,
  align = "left",
  className,
}: Props) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex flex-col gap-3 md:gap-4", alignment, className)}
    >
      {kicker && (
        <span className="text-[10px] md:text-xs text-[var(--theme-accent)] tracking-normal uppercase font-mono">
          {kicker}
        </span>
      )}
      <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-none tracking-normal text-foreground">
        {stripDecorativeSymbols(title)}
      </h2>
      {subtitle && (
        <p className="text-sm md:text-base font-light leading-relaxed max-w-xl text-foreground/60">
          {stripDecorativeSymbols(subtitle)}
        </p>
      )}
    </motion.div>
  );
}
