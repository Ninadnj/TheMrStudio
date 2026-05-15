import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors,
  Zap,
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  CalendarIcon,
  CalendarPlus,
  Clock,
  Hand,
  User,
  Mail,
  Phone as PhoneIcon,
  Loader2,
  Sparkles,
  ShieldCheck,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { addDays, format, isBefore, isSameDay, isToday, setHours, setMinutes, startOfToday } from "date-fns";
import { ka } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/SectionHeader";
import PetalConfetti from "@/components/PetalConfetti";
import QuietStatus from "@/components/QuietStatus";
import { hapticTap, hapticSuccess, hapticWarning } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";
import type { Staff } from "@shared/schema";

type Aftercare = {
  titleKa: string;
  tipKa: string;
  titleEn: string;
  tipEn: string;
};

const aftercareByCategory: Record<string, Aftercare> = {
  Manicure: {
    titleKa: "მოვლის რჩევა",
    tipKa: "თავიდან აიცილე ცხელი წყალი 24 საათის განმავლობაში. ყოველდღე გამოიყენე კუტიკულის ზეთი ნაზი ბრწყინვალებისთვის.",
    titleEn: "Aftercare",
    tipEn: "Avoid hot water for 24 hours. Apply cuticle oil daily for a soft, polished finish.",
  },
  Pedicure: {
    titleKa: "მოვლის რჩევა",
    tipKa: "მოერიდე საუნას და აუზს 24 საათით. დაიტანე დამატენიანებელი ფეხებისთვის ყოველ საღამოს.",
    titleEn: "Aftercare",
    tipEn: "Skip the sauna and pool for 24 hours. Moisturize feet every evening.",
  },
  Epilation: {
    titleKa: "ლაზერის შემდგომი მოვლა",
    tipKa: "48 საათი მოერიდე მზეს, საუნასა და ცხელ შხაპს. დაიტანე დამამშვიდებელი ალოეს გელი.",
    titleEn: "Post-laser care",
    tipEn: "Avoid sun, sauna, and hot showers for 48 hours. Apply soothing aloe gel.",
  },
  Cosmetology: {
    titleKa: "პროცედურის შემდეგ",
    tipKa: "12 საათი არ შეახო და არ დაიტანო მაკიაჟი. სვი წყალი მეტი რაოდენობით კანის ჰიდრატაციისთვის.",
    titleEn: "After your treatment",
    tipEn: "Don't touch the area or apply makeup for 12 hours. Drink extra water for hydration.",
  },
};

const timeSlots = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30",
];

type ServiceOption = {
  value: string;
  labelKa: string;
  labelEn: string;
  hint: string;
  Icon: LucideIcon;
};

const serviceCategories: ServiceOption[] = [
  { value: "Manicure", labelKa: "მანიკური", labelEn: "Manicure", hint: "Manicure", Icon: Hand },
  { value: "Pedicure", labelKa: "პედიკური", labelEn: "Pedicure", hint: "Pedicure", Icon: Scissors },
  { value: "Epilation", labelKa: "ლაზერული ეპილაცია", labelEn: "Laser hair removal", hint: "Laser", Icon: Zap },
  { value: "Cosmetology", labelKa: "კოსმეტოლოგია", labelEn: "Cosmetology", hint: "Cosmetology", Icon: Activity },
];

const totalSteps = 4;

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function BookingForm() {
  const { t, lang } = useLang();
  const savedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("mr_booking_user") || "{}")
      : {};

  const stepLabels = [
    t("სერვისი", "Service"),
    t("სპეციალისტი", "Specialist"),
    t("დრო", "Time"),
    t("კონტაქტი", "Contact"),
  ];

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [date, setDate] = useState<Date>();
  const [submitted, setSubmitted] = useState<{
    category: string;
    serviceLabel: string;
    staffName: string;
    date: string;
    dateISO: string;
    time: string;
    confirmationCode: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: savedUser.fullName || "",
    email: savedUser.email || "",
    phone: savedUser.phone || "",
    serviceCategory: "",
    serviceDetails: "",
    staffId: "",
    time: "",
    notes: "",
  });

  const { toast } = useToast();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { data: availableStaff = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff/category", formData.serviceCategory],
    queryFn: async () => {
      if (!formData.serviceCategory) return [];
      const response = await fetch(`/api/staff/category/${formData.serviceCategory}`);
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    },
    enabled: !!formData.serviceCategory,
  });

  const formattedDate = date ? format(date, "yyyy-MM-dd") : null;

  const { data: availabilityData } = useQuery<{ bookedTimes: string[] }>({
    queryKey: ["/api/bookings/availability", formattedDate, formData.staffId],
    queryFn: async () => {
      if (!formattedDate) return { bookedTimes: [] };
      const url = formData.staffId
        ? `/api/bookings/availability?date=${formattedDate}&staffId=${formData.staffId}`
        : `/api/bookings/availability?date=${formattedDate}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch availability");
      return response.json();
    },
    enabled: !!formattedDate,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const bookedTimes = availabilityData?.bookedTimes || [];

  const availableTimes = useMemo(() => {
    let times = timeSlots.filter((t) => !bookedTimes.includes(t));
    if (date && isToday(date)) {
      const minBookingTime = new Date(Date.now() + 60 * 60 * 1000);
      times = times.filter((time) => {
        const [h, m] = time.split(":").map(Number);
        const slotTime = setMinutes(setHours(new Date(date), h), m);
        return isBefore(minBookingTime, slotTime);
      });
    }
    return times;
  }, [bookedTimes, date]);

  const selectedCategory = serviceCategories.find((c) => c.value === formData.serviceCategory);
  const selectedServiceLabel = selectedCategory
    ? lang === "ka"
      ? selectedCategory.labelKa
      : selectedCategory.labelEn
    : "";
  const selectedStaff = availableStaff.find((s) => s.id === formData.staffId);
  const selectedDateLabel = date
    ? format(date, "d MMMM, yyyy", { locale: lang === "ka" ? ka : undefined })
    : "";

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => apiRequest("POST", "/api/bookings", bookingData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/bookings/availability"] });
      await queryClient.refetchQueries({ queryKey: ["/api/bookings/availability"] });

      setSubmitted({
        category: formData.serviceCategory,
        serviceLabel: selectedServiceLabel,
        staffName: selectedStaff?.name || "",
        date: selectedDateLabel,
        dateISO: formattedDate || "",
        time: formData.time,
        confirmationCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      });

      hapticSuccess();

      toast({
        title: t("მოთხოვნა გაგზავნილია", "Request received"),
        description: t(
          "სპეციალისტი დაგიკავშირდებათ დასადასტურებლად.",
          "A specialist will contact you to confirm."
        ),
      });

      localStorage.setItem(
        "mr_booking_user",
        JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        })
      );
    },
    onError: (error: any) => {
      hapticWarning();
      const fallback = t(
        "რაღაც არასწორად მოხდა. გთხოვთ სცადოთ ხელახლა",
        "Something went wrong. Please try again."
      );
      toast({
        title: t("დაჯავშნა ვერ მოხერხდა", "Booking failed"),
        description: error?.message || fallback,
        variant: "destructive",
      });
    },
  });

  const goNext = () => {
    hapticTap();
    setDirection(1);
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const goBack = () => {
    hapticTap();
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  };

  const canContinue = (() => {
    if (step === 1) return !!formData.serviceCategory;
    if (step === 2) return !!formData.staffId;
    if (step === 3) return !!date && !!formData.time;
    if (step === 4)
      return !!formData.fullName && !!formData.email && !!formData.phone && !!formData.serviceDetails;
    return false;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;

    const selectedStaff = availableStaff.find((s) => s.id === formData.staffId);
    const selectedCategory = serviceCategories.find((c) => c.value === formData.serviceCategory);

    createBookingMutation.mutate({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      service: `${selectedCategory?.labelEn || ""}: ${formData.serviceDetails}`,
      staffId: formData.staffId,
      staffName: selectedStaff?.name || "",
      date: formattedDate,
      time: formData.time,
      notes: formData.notes || null,
    });
  };

  const resetForBookAnother = () => {
    setSubmitted(null);
    setStep(1);
    setDirection(1);
    setDate(undefined);
    setFormData((p) => ({
      ...p,
      serviceCategory: "",
      serviceDetails: "",
      staffId: "",
      time: "",
      notes: "",
    }));
  };

  return (
    <section
      id="booking"
      className="booking-stage relative scroll-mt-20 app-section md:scroll-mt-24"
      ref={sectionRef}
    >
      {submitted && <PetalConfetti />}

      <div className="app-shell-wide md:!max-w-5xl">
        <SectionHeader
          kicker={t("Private beauty concierge", "Private beauty concierge")}
          title={t("დაჯავშნე დრო", "Book your studio time")}
          subtitle={t(
            "აირჩიე სერვისი, სპეციალისტი და დრო ერთი მშვიდი მობილური ნაკადით.",
            "Choose the service, specialist, and time in one calm mobile flow."
          )}
          className="mb-6"
        />

        <div className="booking-panel">
          <BookingSummaryPanel
            t={t}
            step={step}
            totalSteps={totalSteps}
            stepLabels={stepLabels}
            serviceLabel={selectedServiceLabel}
            staffName={selectedStaff?.name || ""}
            dateLabel={selectedDateLabel}
            time={formData.time}
            submitted={!!submitted}
          />

          <div className="booking-main">
            {!submitted && (
              <div className="booking-progress-card mb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--theme-muted1)]">
                      {t("ნაბიჯი", "Step")} {step}
                    </span>
                    <p className="text-[15px] font-semibold text-[var(--theme-text)]">
                      {stepLabels[step - 1]}
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--theme-line)]/70 px-3 py-1 text-[12px] tabular-nums text-[var(--theme-muted1)]">
                    {step} / {totalSteps}
                  </span>
                </div>

                <div className="mt-3 flex gap-1.5">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-colors duration-300",
                        i < step
                          ? "bg-[var(--theme-accent)]"
                          : "bg-[color:color-mix(in_srgb,var(--theme-line)_70%,transparent)]"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="app-card booking-form-card overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="p-4 md:p-6"
                  >
                    <BookingTicket
                      data={submitted}
                      onAddToCalendar={() => downloadIcs(submitted)}
                      onBookAnother={resetForBookAnother}
                      t={t}
                      lang={lang}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="p-4 md:p-6"
                  >
                    {step === 1 && (
                      <StepCategory
                        lang={lang}
                        t={t}
                        selected={formData.serviceCategory}
                        onSelect={(value) => {
                          hapticTap();
                          setFormData((p) => ({ ...p, serviceCategory: value, staffId: "" }));
                        }}
                      />
                    )}

                    {step === 2 && (
                      <StepStaff
                        t={t}
                        staff={availableStaff}
                        loading={staffLoading}
                        selected={formData.staffId}
                        onSelect={(id) => {
                          hapticTap();
                          setFormData((p) => ({ ...p, staffId: id }));
                        }}
                      />
                    )}

                    {step === 3 && (
                      <StepDateTime
                        t={t}
                        lang={lang}
                        date={date}
                        setDate={(d) => {
                          hapticTap();
                          setDate(d);
                          setFormData((p) => ({ ...p, time: "" }));
                        }}
                        time={formData.time}
                        setTime={(time) => {
                          hapticTap();
                          setFormData((p) => ({ ...p, time }));
                        }}
                        availableTimes={availableTimes}
                        hasAvailability={!!availabilityData}
                      />
                    )}

                    {step === 4 && (
                      <StepDetails
                        t={t}
                        formData={formData}
                        onChange={(patch) => setFormData((p) => ({ ...p, ...patch }))}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!submitted && (
            <div className="booking-actions flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1}
                  className="pill-ghost booking-back-button"
                  data-testid="button-step-back"
                  aria-label={t("უკან", "Back")}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t("უკან", "Back")}</span>
                </button>

                <div className="flex-1" />

                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canContinue}
                    className="pill-primary flex-1 max-w-[220px]"
                    data-testid="button-step-next"
                  >
                    {t("გაგრძელება", "Continue")}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canContinue || createBookingMutation.isPending}
                    className="pill-primary flex-1 max-w-[220px]"
                    data-testid="button-confirm-booking"
                  >
                    {createBookingMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("გაგზავნა...", "Sending…")}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {t("დადასტურება", "Confirm")}
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------- Sub-steps -------------- */

function BookingSummaryPanel({
  t,
  step,
  totalSteps,
  stepLabels,
  serviceLabel,
  staffName,
  dateLabel,
  time,
  submitted,
}: {
  t: T;
  step: number;
  totalSteps: number;
  stepLabels: string[];
  serviceLabel: string;
  staffName: string;
  dateLabel: string;
  time: string;
  submitted: boolean;
}) {
  const snapshot = [
    { label: t("სერვისი", "Service"), value: serviceLabel },
    { label: t("სპეციალისტი", "Specialist"), value: staffName },
    { label: t("თარიღი", "Date"), value: dateLabel },
    { label: t("დრო", "Time"), value: time },
  ];

  return (
    <aside className="booking-summary">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="app-eyebrow">THE MR Studio</p>
          <h3 className="booking-summary-title mt-1">
            {t("ჯავშანი", "Booking")}
          </h3>
        </div>
        <div className="booking-summary-mark" aria-hidden>
          <Sparkles className="h-4 w-4" strokeWidth={1.7} />
        </div>
      </div>

      <div className="booking-summary-status">
        <ShieldCheck className="h-4 w-4" strokeWidth={1.7} />
        <span>{submitted ? t("მოთხოვნა მიღებულია", "Request received") : t("ცოცხალი კალენდარი", "Live calendar")}</span>
      </div>

      <div className="booking-step-rail" aria-label={t("დაჯავშნის ნაბიჯები", "Booking steps")}>
        {stepLabels.map((label, index) => {
          const number = index + 1;
          const isDone = number < step || submitted;
          const isActive = number === step && !submitted;
          return (
            <div
              key={label}
              className="booking-step-item"
              data-active={isActive}
              data-complete={isDone}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="booking-step-dot">{isDone ? <Check className="h-3.5 w-3.5" /> : number}</span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="booking-snapshot">
        {snapshot.map((item) => (
          <div key={item.label} className="booking-snapshot-row">
            <span>{item.label}</span>
            <strong>{item.value || "—"}</strong>
          </div>
        ))}
      </div>

      <div className="booking-location">
        <MapPin className="h-4 w-4" strokeWidth={1.7} />
        <span>{t("დიდი დიღომი, თბილისი", "Didi Dighomi, Tbilisi")}</span>
      </div>
    </aside>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-[18px] font-semibold text-[var(--theme-text)] tracking-[-0.01em]">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[13px] text-[var(--theme-muted1)] mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

type T = (ka: string, en: string) => string;

function StepCategory({
  selected,
  onSelect,
  lang,
  t,
}: {
  selected: string;
  onSelect: (value: string) => void;
  lang: "ka" | "en";
  t: T;
}) {
  return (
    <div data-testid="step-category">
      <StepHeading
        title={t("რომელი სერვისი გაინტერესებს?", "What are you looking for?")}
        subtitle={t("აირჩიე კატეგორია", "Pick a category")}
      />
      <div className="grid grid-cols-2 gap-2.5">
        {serviceCategories.map(({ value, labelKa, labelEn, hint, Icon }) => {
          const isActive = selected === value;
          const label = lang === "ka" ? labelKa : labelEn;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className={cn(
                "booking-choice-card press-tap text-left rounded-2xl border p-3.5 min-h-[110px] transition-all flex flex-col gap-2 justify-between",
                isActive
                  ? "border-[var(--theme-accent)] bg-[color:color-mix(in_srgb,var(--theme-accent)_10%,transparent)]"
                  : "border-[var(--theme-line)]/70 bg-[var(--theme-surface)] hover:border-[var(--theme-accent)]/40"
              )}
              data-active={isActive}
              data-testid={`category-${value}`}
              aria-pressed={isActive}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                  isActive
                    ? "bg-[color:color-mix(in_srgb,var(--theme-accent)_18%,transparent)]"
                    : "bg-[color:color-mix(in_srgb,var(--theme-soft)_25%,transparent)]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-[var(--theme-accent)]" : "text-[var(--theme-muted1)]"
                  )}
                  strokeWidth={1.7}
                />
              </div>
              <div>
                <div className="text-[14.5px] font-semibold text-[var(--theme-text)] leading-tight">
                  {label}
                </div>
                {lang === "ka" && (
                  <div className="text-[11px] text-[var(--theme-muted1)]/80 mt-0.5">{hint}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepStaff({
  staff,
  loading,
  selected,
  onSelect,
  t,
}: {
  staff: Staff[];
  loading: boolean;
  selected: string;
  onSelect: (id: string) => void;
  t: T;
}) {
  return (
    <div data-testid="step-staff">
      <StepHeading
        title={t("აირჩიე სპეციალისტი", "Choose your specialist")}
        subtitle={t("ვინ შეასრულებს პროცედურას", "Who'll be performing the treatment")}
      />

      {loading && (
        <QuietStatus label={t("სპეციალისტის ძებნა…", "Finding your specialist…")} />
      )}

      {!loading && staff.length === 0 && (
        <QuietStatus
          label={t(
            "სპეციალისტი არ მოიძებნა — სცადე სხვა კატეგორია.",
            "No specialist available — try another category."
          )}
        />
      )}

      {!loading && staff.length > 0 && (
        <div className="space-y-2">
          {staff.map((s) => {
            const isActive = selected === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className={cn(
                  "booking-choice-card press-tap w-full text-left rounded-2xl border p-3 transition-all flex items-center gap-3",
                  isActive
                    ? "border-[var(--theme-accent)] bg-[color:color-mix(in_srgb,var(--theme-accent)_10%,transparent)]"
                    : "border-[var(--theme-line)]/70 bg-[var(--theme-surface)] hover:border-[var(--theme-accent)]/40"
                )}
                data-active={isActive}
                data-testid={`staff-${s.id}`}
                aria-pressed={isActive}
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
                    isActive
                      ? "bg-[color:color-mix(in_srgb,var(--theme-accent)_18%,transparent)]"
                      : "bg-[color:color-mix(in_srgb,var(--theme-soft)_25%,transparent)]"
                  )}
                >
                  <User
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-[var(--theme-accent)]" : "text-[var(--theme-muted1)]"
                    )}
                    strokeWidth={1.6}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-[var(--theme-text)] leading-tight truncate">
                    {s.name}
                  </div>
                </div>
                {isActive && (
                  <Check className="w-5 h-5 text-[var(--theme-accent)] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepDateTime({
  date,
  setDate,
  time,
  setTime,
  availableTimes,
  hasAvailability,
  t,
  lang,
}: {
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
  time: string;
  setTime: (t: string) => void;
  availableTimes: string[];
  hasAvailability: boolean;
  t: T;
  lang: "ka" | "en";
}) {
  const dateLocale = lang === "ka" ? ka : undefined;
  const quickDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(startOfToday(), index)),
    []
  );

  return (
    <div data-testid="step-datetime">
      <StepHeading
        title={t("როდის გერჩივნა?", "When suits you?")}
        subtitle={t("აირჩიე თარიღი და დრო", "Choose a date and time")}
      />

      <div className="booking-date-rail scrollbar-hide" aria-label={t("სწრაფი თარიღები", "Quick dates")}>
        {quickDates.map((quickDate, index) => {
          const isActive = date ? isSameDay(date, quickDate) : false;
          const dayLabel =
            index === 0
              ? t("დღეს", "Today")
              : index === 1
                ? t("ხვალ", "Tomorrow")
                : format(quickDate, "EEE", { locale: dateLocale });

          return (
            <button
              key={quickDate.toISOString()}
              type="button"
              onClick={() => setDate(quickDate)}
              className="booking-date-chip press-tap"
              data-active={isActive}
              aria-pressed={isActive}
              data-testid={`date-quick-${index}`}
            >
              <span>{dayLabel}</span>
              <strong>{format(quickDate, "d", { locale: dateLocale })}</strong>
              <em>{format(quickDate, "MMM", { locale: dateLocale })}</em>
            </button>
          );
        })}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "booking-choice-card press-tap w-full rounded-2xl border px-4 h-[60px] flex items-center gap-3 text-left transition-colors",
              date
                ? "border-[var(--theme-accent)]/50 bg-[color:color-mix(in_srgb,var(--theme-accent)_8%,transparent)]"
                : "border-[var(--theme-line)]/70 bg-[var(--theme-surface)] hover:border-[var(--theme-accent)]/40"
            )}
            data-active={!!date}
            data-testid="datetime-date-trigger"
          >
            <div className="w-9 h-9 rounded-xl bg-[color:color-mix(in_srgb,var(--theme-soft)_25%,transparent)] flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4 text-[var(--theme-muted1)]" strokeWidth={1.7} />
            </div>
            <div className="flex-1">
              <div className="text-[11px] text-[var(--theme-muted1)]">{t("თარიღი", "Date")}</div>
              <div className="text-[15px] font-medium text-[var(--theme-text)]">
                {date
                  ? format(date, "d MMMM, yyyy", { locale: dateLocale })
                  : t("სრული კალენდარი", "Full calendar")}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--theme-muted1)]/40" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 rounded-[22px] border border-[var(--theme-line)]/70 bg-[var(--theme-surface)] shadow-[var(--ios-shadow-3)]"
          align="start"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={dateLocale}
            disabled={(d) => isBefore(d, startOfToday())}
          />
        </PopoverContent>
      </Popover>

      {date && (
        <div className="mt-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-[var(--theme-muted1)]" strokeWidth={1.7} />
            <span className="text-[12px] text-[var(--theme-muted1)]">
              {t("ხელმისაწვდომი დრო", "Available times")}
            </span>
          </div>

          {!hasAvailability ? (
            <QuietStatus label={t("კალენდრის ჩატვირთვა…", "Reading the calendar…")} className="!py-6" />
          ) : availableTimes.length === 0 ? (
            <QuietStatus
              label={t("სრულად დაჯავშნულია. სცადე სხვა დღე.", "Fully booked. Try another day.")}
              className="!py-6"
            />
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {availableTimes.map((t) => {
                const isActive = time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={cn(
                      "booking-time-chip press-tap rounded-xl h-11 text-[13px] font-semibold tabular-nums transition-colors",
                      isActive
                        ? "bg-[var(--theme-accent)] text-[var(--theme-on-accent)]"
                        : "bg-[var(--theme-surface)] text-[var(--theme-text)]/85 border border-[var(--theme-line)]/70 hover:border-[var(--theme-accent)]/40"
                    )}
                    data-active={isActive}
                    data-testid={`time-${t}`}
                    aria-pressed={isActive}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepDetails({
  formData,
  onChange,
  t,
}: {
  formData: {
    fullName: string;
    email: string;
    phone: string;
    serviceDetails: string;
    notes: string;
  };
  onChange: (patch: Partial<typeof formData>) => void;
  t: T;
}) {
  return (
    <div data-testid="step-details">
      <StepHeading
        title={t("ბოლო შეხება", "Final touch")}
        subtitle={t("საკონტაქტო ინფორმაცია", "Contact information")}
      />

      <div className="space-y-3">
        <FieldWithIcon Icon={User} label={t("სახელი და გვარი", "Full name")}>
          <Input
            id="booking-full-name"
            autoComplete="name"
            value={formData.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder={t("თქვენი სახელი", "Your name")}
            className="bg-transparent border-0 p-0 h-auto text-[15px] text-[var(--theme-text)] placeholder:text-[var(--theme-muted1)]/50 focus-visible:ring-0"
            data-testid="input-full-name"
            required
          />
        </FieldWithIcon>

        <FieldWithIcon Icon={Mail} label={t("ელ. ფოსტა", "Email")}>
          <Input
            id="booking-email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="example@email.com"
            className="bg-transparent border-0 p-0 h-auto text-[15px] text-[var(--theme-text)] placeholder:text-[var(--theme-muted1)]/50 focus-visible:ring-0"
            data-testid="input-email"
            required
          />
        </FieldWithIcon>

        <FieldWithIcon Icon={PhoneIcon} label={t("ტელეფონი", "Phone")}>
          <Input
            id="booking-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+995 555 000 000"
            className="bg-transparent border-0 p-0 h-auto text-[15px] text-[var(--theme-text)] placeholder:text-[var(--theme-muted1)]/50 focus-visible:ring-0 tabular-nums"
            data-testid="input-phone"
            required
          />
        </FieldWithIcon>

        <div className="rounded-2xl border border-[var(--theme-line)]/70 bg-[var(--theme-surface)] p-3.5">
          <div className="text-[11px] text-[var(--theme-muted1)] mb-1.5">
            {t("პროცედურის დეტალები", "Treatment details")}
          </div>
          <Textarea
            value={formData.serviceDetails}
            onChange={(e) => onChange({ serviceDetails: e.target.value })}
            placeholder={t("მიუთითე სასურველი პროცედურა...", "Describe the treatment you'd like…")}
            className="bg-transparent border-0 p-0 min-h-[60px] text-[15px] text-[var(--theme-text)] placeholder:text-[var(--theme-muted1)]/50 focus-visible:ring-0 resize-none"
            data-testid="textarea-service-details"
            required
          />
        </div>

        <div className="rounded-2xl border border-[var(--theme-line)]/70 bg-[var(--theme-surface)] p-3.5">
          <div className="text-[11px] text-[var(--theme-muted1)] mb-1.5">
            {t("შენიშვნები (არასავალდებულო)", "Notes (optional)")}
          </div>
          <Textarea
            value={formData.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder={t("სპეციალური სურვილები...", "Anything we should know…")}
            className="bg-transparent border-0 p-0 min-h-[50px] text-[15px] text-[var(--theme-text)] placeholder:text-[var(--theme-muted1)]/50 focus-visible:ring-0 resize-none"
            data-testid="textarea-notes"
          />
        </div>
      </div>
    </div>
  );
}

/* -------------- Bits -------------- */

function FieldWithIcon({
  Icon,
  label,
  children,
}: {
  Icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="booking-field rounded-2xl border border-[var(--theme-line)]/70 bg-[var(--theme-surface)] p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[color:color-mix(in_srgb,var(--theme-soft)_25%,transparent)] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[var(--theme-muted1)]" strokeWidth={1.7} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-[var(--theme-muted1)]">{label}</div>
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[12px] text-[var(--theme-muted1)]">{label}</span>
      <span className="text-[14px] font-medium text-[var(--theme-text)] text-right">
        {value || "—"}
      </span>
    </div>
  );
}

/* -------------- Confirmation ticket -------------- */

type SubmittedData = {
  category: string;
  serviceLabel: string;
  staffName: string;
  date: string;
  dateISO: string;
  time: string;
  confirmationCode: string;
};

function BookingTicket({
  data,
  onAddToCalendar,
  onBookAnother,
  t,
  lang,
}: {
  data: SubmittedData;
  onAddToCalendar: () => void;
  onBookAnother: () => void;
  t: T;
  lang: "ka" | "en";
}) {
  const aftercare = aftercareByCategory[data.category];

  return (
    <div className="space-y-3">
      {/* Heading */}
      <div className="text-center pb-1">
        <p className="app-eyebrow">{t("დადასტურება", "Confirmation")}</p>
        <h3 className="text-[20px] font-semibold text-[var(--theme-text)] tracking-[-0.01em] mt-1">
          {t("მოთხოვნა მიღებულია", "Request received")}
        </h3>
        <p className="text-[13px] text-[var(--theme-muted1)] mt-1.5 max-w-xs mx-auto">
          {t(
            "სპეციალისტი დაგიკავშირდებათ დასადასტურებლად.",
            "A specialist will contact you to confirm."
          )}
        </p>
      </div>

      {/* Boarding-pass ticket */}
      <div className="relative max-w-sm mx-auto rounded-[24px] overflow-hidden border border-[var(--theme-line)]/70 bg-[color:color-mix(in_srgb,var(--theme-soft)_14%,var(--theme-surface))] shadow-[var(--ios-shadow-2)]">
        <div className="px-5 pt-5 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[var(--theme-accent)]/35 bg-[var(--theme-surface)] mb-2">
            <span className="font-serif italic text-[18px] text-[var(--theme-accent)] leading-none">
              M·R
            </span>
          </div>
          <p className="text-[10.5px] uppercase tracking-[0.18em] text-[var(--theme-muted1)]">
            THE MR Studio · {t("თბილისი", "Tbilisi")}
          </p>
          <p className="font-mono text-[12px] text-[var(--theme-text)] mt-1 tabular-nums tracking-[0.12em]">
            #{data.confirmationCode}
          </p>
        </div>

        <div className="relative">
          <span aria-hidden className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--theme-bg)] border border-[var(--theme-line)]/70" />
          <span aria-hidden className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--theme-bg)] border border-[var(--theme-line)]/70" />
          <div className="border-t border-dashed border-[var(--theme-line)]" />
        </div>

        <div className="px-5 py-4 space-y-2.5">
          <SummaryRow label={t("სერვისი", "Service")} value={data.serviceLabel} />
          <SummaryRow label={t("სპეციალისტი", "Specialist")} value={data.staffName} />
          <SummaryRow label={t("თარიღი", "Date")} value={data.date} />
          <SummaryRow label={t("დრო", "Time")} value={data.time} />
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onAddToCalendar}
            className="press-tap w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-line)]/70 text-[13.5px] font-semibold text-[var(--theme-text)] hover:border-[var(--theme-accent)]/50 transition-colors"
            data-testid="button-add-to-calendar"
          >
            <CalendarPlus className="w-4 h-4" strokeWidth={1.8} />
            {t("კალენდარში დამატება", "Add to Calendar")}
          </button>
        </div>
      </div>

      {aftercare && (
        <div className="max-w-sm mx-auto rounded-2xl border border-[var(--theme-accent)]/30 bg-[color:color-mix(in_srgb,var(--theme-accent)_10%,transparent)] p-4">
          <div className="text-[11px] font-semibold text-[var(--theme-accent)] mb-1">
            {lang === "ka" ? aftercare.titleKa : aftercare.titleEn}
          </div>
          <p className="text-[13px] text-[var(--theme-text)]/85 leading-relaxed">
            {lang === "ka" ? aftercare.tipKa : aftercare.tipEn}
          </p>
        </div>
      )}

      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={onBookAnother}
          className="pill-ghost"
          data-testid="button-book-another"
        >
          {t("ახალი ჯავშნა", "Book another")}
        </button>
      </div>
    </div>
  );
}

/* -------------- ICS generator -------------- */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Format a Date as a floating local time ICS string (YYYYMMDDTHHMMSS — no Z). */
function toIcsLocal(d: Date) {
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function toIcsUtc(d: Date) {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcsText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

function buildIcs(data: SubmittedData): string {
  const [y, m, d] = data.dateISO.split("-").map(Number);
  const [hh, mm] = data.time.split(":").map(Number);
  const start = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // default 1h

  const summary = escapeIcsText(`THE MR Studio — ${data.serviceLabel}`);
  const description = escapeIcsText(
    `Specialist: ${data.staffName}\nConfirmation: ${data.confirmationCode}`
  );
  const location = escapeIcsText("დიდი დიღომი, ვეფხისტყაოსნის 22/24, თბილისი");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//THE MR Studio//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${data.confirmationCode}@mrstudio`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsLocal(start)}`,
    `DTEND:${toIcsLocal(end)}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadIcs(data: SubmittedData) {
  if (!data.dateISO || !data.time) return;
  const ics = buildIcs(data);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mr-studio-${data.confirmationCode}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
