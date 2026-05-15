import { useQuery } from "@tanstack/react-query";
import type { Trend, TrendsSection as TrendsSectionType } from "@shared/schema";
import { isVideoUrl } from "@/lib/videoUtils";
import SectionHeader from "@/components/SectionHeader";
import QuietStatus from "@/components/QuietStatus";
import { stripDecorativeSymbols } from "@/lib/sanitizeText";
import { useLang } from "@/lib/i18n";

export default function TrendsSection() {
  const { t } = useLang();
  const { data: trends = [], isLoading } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
  });

  const { data: sectionData } = useQuery<TrendsSectionType>({
    queryKey: ["/api/trends-section"],
  });

  if (isLoading) {
    return (
      <section className="app-section">
        <div className="app-shell">
          <QuietStatus label="Bringing in this season's edits…" />
        </div>
      </section>
    );
  }

  if (trends.length === 0) return null;

  const sortedTrends = [...trends].sort((a, b) => a.order.localeCompare(b.order));

  return (
    <section id="trends" className="scroll-mt-20 app-section md:scroll-mt-24">
      <div className="app-shell mb-4">
        <SectionHeader
          title={sectionData?.title || t("ტრენდები", "Trends")}
          subtitle={t("ფერები, ფინიშები, პროცედურები ახლა.", "Colors, finishes, treatments — now.")}
        />
      </div>

      {/* Native horizontal swipe carousel — snap-x snap-mandatory */}
      <div className="overflow-x-auto scrollbar-hide overscroll-x-contain snap-x snap-mandatory">
        <div className="flex gap-3 px-5 md:justify-center md:px-6">
          {sortedTrends.map((trend) => (
            <article
              key={trend.id}
              className="editorial-grain snap-center shrink-0 w-[78vw] sm:w-[60vw] md:w-[320px] aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--theme-surface-muted)] border border-[var(--theme-line)]/60 shadow-[var(--ios-shadow-1)] relative group"
            >
              {(() => {
                const isVideo = isVideoUrl(trend.imageUrl);
                const cls =
                  "h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]";
                return isVideo ? (
                  <video
                    src={trend.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={cls}
                  />
                ) : (
                  <img
                    src={trend.imageUrl}
                    alt={stripDecorativeSymbols(trend.title)}
                    className={cls}
                    loading="lazy"
                  />
                );
              })()}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/65 via-black/15 to-transparent">
                <h3 className="text-white text-[15px] font-semibold leading-tight">
                  {stripDecorativeSymbols(trend.title)}
                </h3>
                {trend.description && (
                  <p className="text-white/80 text-[12px] mt-1 line-clamp-2">
                    {stripDecorativeSymbols(trend.description)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
