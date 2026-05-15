import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { stripDecorativeSymbols } from "@/lib/sanitizeText";

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  /** Deprecated — kept for backward compat. */
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex flex-col gap-1.5", alignment, className)}
    >
      {kicker && <span className="app-eyebrow">{stripDecorativeSymbols(kicker)}</span>}
      <h2 className="app-title">{stripDecorativeSymbols(title)}</h2>
      {subtitle && <p className="app-subtle max-w-xl">{stripDecorativeSymbols(subtitle)}</p>}
    </motion.div>
  );
}
