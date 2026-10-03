import { useState, useMemo } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";
import { requestBooking, usePriceMenu, type BookingCategory, type MenuGroup } from "@/lib/serviceMenu";
import { stagger } from "@/lib/reveal";

function priceFromOf(group: MenuGroup): number {
  return group.items.reduce(
    (min, it) => (typeof it.price === "number" && it.price < min ? it.price : min),
    Infinity
  );
}

/** Prices as a menu: name, hairline leader, tabular price, a quiet "Book" on every row. */
export default function PriceList() {
  const { t, lang } = useLang();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { menu } = usePriceMenu();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menu
      .filter((group) => activeFilter === "all" || group.id === activeFilter)
      .map((group) =>
        q
          ? {
              ...group,
              items: group.items.filter(
                (it) => it.nameEn.toLowerCase().includes(q) || it.nameKa.toLowerCase().includes(q)
              ),
            }
          : group
      )
      .filter((group) => group.items.length > 0);
  }, [menu, activeFilter, search]);

  const filters = [
    { id: "all", label: t("ყველა", "All") },
    ...menu
      .filter((group) => group.items.length > 0)
      .map((group) => ({ id: group.id, label: lang === "ka" ? group.shortKa : group.shortEn })),
  ];

  return (
    <section id="prices" className="section scroll-mt-20 md:scroll-mt-24" aria-labelledby="prices-title">
      <div className="shell prices-grid">
        <div className="prices-head">
          <p className="eyebrow" data-reveal="rise">{t("მენიუ", "Menu")}</p>
          <h2 id="prices-title" className="display prices-title" data-reveal="mask">
            <span>{t("ფასები", "Prices")}</span>
          </h2>

          <div className="prices-search" data-reveal="rise" style={stagger(1)}>
            <Search className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("პროცედურის ძებნა", "Search a treatment")}
              aria-label={t("პროცედურის ძებნა", "Search a treatment")}
              className="prices-search-input"
              data-testid="prices-search"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="prices-search-clear"
                aria-label={t("გასუფთავება", "Clear search")}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="text-tabs" role="group" aria-label={t("კატეგორია", "Category")} data-reveal="rise" style={stagger(2)}>
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  hapticTap();
                  setActiveFilter(f.id);
                }}
                className="text-tab"
                data-active={activeFilter === f.id}
                aria-pressed={activeFilter === f.id}
                data-testid={`price-filter-${f.id}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="prices-menu">
          {filtered.length === 0 && search && (
            <p className="prices-empty">
              {t(`„${search}“ ვერ მოიძებნა.`, `Nothing matches “${search}”.`)}
            </p>
          )}

          {filtered.map((group) => (
            <section
              key={group.id}
              id={`category-${group.id}`}
              className="menu-group scroll-mt-24"
              aria-labelledby={`menu-${group.id}`}
              data-testid={`price-category-${group.id}`}
            >
              <header className="menu-group-head" data-reveal="rise">
                <h3 id={`menu-${group.id}`} className="display menu-group-title">
                  {lang === "ka" ? group.titleKa : group.titleEn}
                </h3>
                <span className="menu-group-meta">
                  {t(`${priceFromOf(group)} ₾-დან`, `from ${priceFromOf(group)} ₾`)}
                </span>
              </header>

              <ul className="menu-rows">
                {group.items.map((item, i) => {
                  const name = lang === "ka" ? item.nameKa : item.nameEn;
                  const duration = item.durationMin ? t(`${item.durationMin} წთ`, `${item.durationMin} min`) : null;
                  const detail = [lang === "ka" ? item.nameEn : null, duration].filter(Boolean).join(" · ");
                  return (
                    <li key={item.id} data-reveal="rise" style={stagger(i)}>
                      <button
                        type="button"
                        onClick={() => {
                          hapticTap();
                          requestBooking({ category: item.booking as BookingCategory, treatmentKey: item.id });
                        }}
                        className="menu-row"
                        data-testid={`price-row-${group.id}-${i}`}
                      >
                        <span className="menu-row-name">
                          <span>{name}</span>
                          {detail && <small>{detail}</small>}
                        </span>
                        <span className="menu-row-leader" aria-hidden />
                        <span className="menu-row-price">
                          {item.price}
                          <span className="menu-row-currency"> ₾</span>
                        </span>
                        <span className="menu-row-book" aria-hidden>
                          <span className="menu-row-book-text">{t("დაჯავშნა", "Book")}</span>
                          <ArrowRight className="menu-row-book-icon h-4 w-4" strokeWidth={1.5} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <p className="prices-note">
            {t(
              "ფასები მითითებულია ლარში (₾) და შეიძლება შეიცვალოს.",
              "Prices are in Georgian lari (₾) and may change."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
