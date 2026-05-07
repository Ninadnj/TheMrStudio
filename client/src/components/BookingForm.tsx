import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors,
  Zap,
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  CalendarIcon,
  Clock,
  Hand,
  User,
  Mail,
  Phone as PhoneIcon,
  Loader2,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { format, isToday, isBefore, startOfToday, setHours, setMinutes } from "date-fns";
import { ka } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/SectionHeader";
import PetalConfetti from "@/components/PetalConfetti";
import { hapticTap, hapticSuccess, hapticWarning } from "@/lib/haptics";
import type { Staff } from "@shared/schema";

const aftercareByCategory: Record<string, { titleKa: string; tipKa: string }> = {
  Manicure: {
    titleKa: "მოვლის რჩევა",
    tipKa: "თავიდან აიცილე ცხელი წყალი 24 საათის განმავლობაში. ყოველდღე გამოიყენე კუტიკულის ზეთი ნაზი ბრწყინვალებისთვის.",
  },
  Pedicure: {
    titleKa: "მოვლის რჩევა",
    tipKa: "მოერიდე საუნას და აუზს 24 საათით. დაიტანე დამატენიანებელი ფეხებისთვის ყოველ საღამოს.",
  },
  Epilation: {
    titleKa: "ლაზერის შემდგომი მოვლა",
    tipKa: "48 საათი მოერიდე მზეს, საუნასა და ცხელ შხაპს. დაიტანე დამამშვიდებელი ალოეს გელი.",
  },
  Cosmetology: {
    titleKa: "პროცედურის შემდეგ",
    tipKa: "12 საათი არ შეახო და არ დაიტანო მაკიაჟი. სვი წყალი მეტი რაოდენობით კანის ჰიდრატაციისთვის.",
  },
};

const timeSlots = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30",
];

const serviceCategories: {
  value: string;
  label: string;
  hint: string;
  Icon: LucideIcon;
}[] = [
  { value: "Manicure", label: "მანიკური", hint: "Nails — Manicure", Icon: Hand },
  { value: "Pedicure", label: "პედიკური", hint: "Nails — Pedicure", Icon: Scissors },
  { value: "Epilation", label: "ლაზერული ეპილაცია", hint: "Laser hair removal", Icon: Zap },
  { value: "Cosmetology", label: "კოსმეტოლოგია", hint: "Skin & Injectables", Icon: Activity },
];

const totalSteps = 4;

const bookingSteps: { step: number; label: string; Icon: LucideIcon }[] = [
  { step: 1, label: "სერვისი", Icon: ClipboardList },
  { step: 2, label: "სპეციალისტი", Icon: User },
  { step: 3, label: "დრო", Icon: CalendarIcon },
  { step: 4, label: "კონტაქტი", Icon: Mail },
];

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function BookingForm() {
  const savedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("mr_booking_user") || "{}")
      : {};

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [date, setDate] = useState<Date>();
  const [submitted, setSubmitted] = useState<{
    category: string;
    serviceLabel: string;
    staffName: string;
    date: string;
    time: string;
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
  const [isVisible, setIsVisible] = useState(false);
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

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => apiRequest("POST", "/api/bookings", bookingData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/bookings/availability"] });
      await queryClient.refetchQueries({ queryKey: ["/api/bookings/availability"] });

      const selectedCategory = serviceCategories.find((c) => c.value === formData.serviceCategory);
      const selectedStaff = availableStaff.find((s) => s.id === formData.staffId);

      setSubmitted({
        category: formData.serviceCategory,
        serviceLabel: selectedCategory?.label || "",
        staffName: selectedStaff?.name || "",
        date: date ? format(date, "d MMMM, yyyy", { locale: ka }) : "",
        time: formData.time,
      });

      hapticSuccess();

      toast({
        title: "მოთხოვნა გაგზავნილია",
        description: "სპეციალისტი დაგიკავშირდებათ დასადასტურებლად.",
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
      const errorMessage = error?.message || "რაღაც არასწორად მოხდა. გთხოვთ სცადოთ ხელახლა";
      toast({
        title: "დაჯავშნა ვერ მოხერხდა",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
      service: `${selectedCategory?.label || ""}: ${formData.serviceDetails}`,
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
      className="dark relative scroll-mt-24 bg-background py-12 md:scroll-mt-28 md:py-24 overflow-hidden"
      ref={sectionRef}
    >
      {/* Confetti shower on success */}
      {submitted && <PetalConfetti />}

      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-5 md:px-6">
        <SectionHeader
          kicker="06 / Booking"
          title="რეზერვაცია"
          subtitle="აირჩიე სერვისი, სპეციალისტი და დრო — 4 ნაბიჯში."
          align="center"
          light
          className={cn(
            "mb-6 md:mb-10 mx-auto transition-opacity duration-500",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        />

        {!submitted && (
          <>
            <div className="grid grid-cols-4 gap-2 mb-6" aria-label="Booking progress">
              {bookingSteps.map(({ step: stepNumber, label, Icon }) => {
                const reached = stepNumber <= step;
                const active = stepNumber === step;
                return (
                  <div
                    key={stepNumber}
                    className={cn(
                      "min-h-[58px] rounded-[8px] border px-2 py-2 flex flex-col items-center justify-center gap-1 transition-all duration-300",
                      active
                        ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/12 text-[var(--theme-accent)]"
                        : reached
                          ? "border-[var(--theme-accent)]/45 bg-[var(--theme-accent)]/10 text-foreground/85"
                          : "border-white/14 bg-white/[0.035] text-foreground/62"
                    )}
                    aria-current={active ? "step" : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2 : 1.6} />
                    <span className="text-[10px] font-medium leading-none truncate max-w-full text-center">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step heading */}
            <div className="text-center mb-5">
              <p className="text-[10px] uppercase font-mono text-foreground/40">
                Step {step} / {totalSteps}
              </p>
            </div>
          </>
        )}

        {/* Card */}
        <div className="rounded-[8px] bg-white/[0.035] border border-white/10 backdrop-blur-sm overflow-hidden shadow-[0_28px_90px_-68px_rgba(0,0,0,0.75)]">
          <AnimatePresence mode="wait" custom={direction}>
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 md:p-10 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--theme-accent)]/15 mb-5">
                  <CheckCircle2 className="w-9 h-9 text-[var(--theme-accent)]" strokeWidth={1.6} />
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-2">
                  მოთხოვნა მიღებულია
                </h3>
                <p className="text-sm text-foreground/60 mb-6 max-w-md mx-auto">
                  დიდი მადლობა! სპეციალისტი დაგიკავშირდებათ დასადასტურებლად.
                </p>

                <div className="rounded-[8px] bg-white/[0.04] border border-white/10 p-4 md:p-5 text-left max-w-md mx-auto mb-4 space-y-2.5">
                  <SummaryRow label="სერვისი" value={submitted.serviceLabel} />
                  <SummaryRow label="სპეციალისტი" value={submitted.staffName} />
                  <SummaryRow label="თარიღი" value={submitted.date} />
                  <SummaryRow label="დრო" value={submitted.time} />
                </div>

                {aftercareByCategory[submitted.category] && (
                  <div className="rounded-[8px] border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 p-4 md:p-5 text-left max-w-md mx-auto mb-6">
                    <div className="text-[10px] uppercase font-mono text-[var(--theme-accent)] mb-1.5">
                      {aftercareByCategory[submitted.category].titleKa}
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed">
                      {aftercareByCategory[submitted.category].tipKa}
                    </p>
                  </div>
                )}

                <Button
                  onClick={resetForBookAnother}
                  className="press-tap rounded-full h-12 px-6 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-on-accent)] font-medium tracking-normal accent-glow"
                  data-testid="button-book-another"
                >
                  ახალი ჯავშნა
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="p-5 md:p-8"
              >
                {step === 1 && (
                  <StepCategory
                    selected={formData.serviceCategory}
                    onSelect={(value) => {
                      hapticTap();
                      setFormData((p) => ({ ...p, serviceCategory: value, staffId: "" }));
                    }}
                  />
                )}

                {step === 2 && (
                  <StepStaff
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
                    date={date}
                    setDate={(d) => {
                      hapticTap();
                      setDate(d);
                      setFormData((p) => ({ ...p, time: "" }));
                    }}
                    time={formData.time}
                    setTime={(t) => {
                      hapticTap();
                      setFormData((p) => ({ ...p, time: t }));
                    }}
                    availableTimes={availableTimes}
                    hasAvailability={!!availabilityData}
                  />
                )}

                {step === 4 && (
                  <StepDetails
                    formData={formData}
                    onChange={(patch) => setFormData((p) => ({ ...p, ...patch }))}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {!submitted && (
          <div className="flex items-center justify-between gap-3 mt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 1}
              className="press-tap rounded-full h-12 px-5 text-foreground/70 hover:text-foreground hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
              data-testid="button-step-back"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              უკან
            </Button>

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
              className="press-tap accent-glow rounded-full h-12 px-6 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-on-accent)] font-medium tracking-normal disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                data-testid="button-step-next"
              >
                გაგრძელება
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canContinue || createBookingMutation.isPending}
                className="press-tap accent-glow rounded-full h-12 px-6 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-on-accent)] font-medium tracking-normal disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                data-testid="button-confirm-booking"
              >
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    გაგზავნა...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    დადასტურება
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------- Sub-steps -------------- */

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h3 className="font-display text-xl md:text-2xl text-foreground tracking-normal">{title}</h3>
      {subtitle && <p className="text-sm text-foreground/55 mt-1">{subtitle}</p>}
    </div>
  );
}

function StepCategory({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div data-testid="step-category">
      <StepHeading title="რომელი სერვისი გაინტერესებს?" subtitle="აირჩიე კატეგორია" />
      <div className="grid grid-cols-2 gap-2.5 md:gap-3">
        {serviceCategories.map(({ value, label, hint, Icon }) => {
          const isActive = selected === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className={cn(
                "press-tap text-left rounded-[8px] border p-4 min-h-[110px] transition-all flex flex-col gap-2 justify-between",
                isActive
                  ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/12"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
              )}
              data-testid={`category-${value}`}
              aria-pressed={isActive}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isActive ? "bg-[var(--theme-accent)]/20" : "bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-[var(--theme-accent)]" : "text-foreground/70"
                  )}
                  strokeWidth={1.6}
                />
              </div>
              <div>
                <div className="text-[15px] font-medium text-foreground leading-tight">{label}</div>
                <div className="text-[11px] text-foreground/45 mt-0.5">{hint}</div>
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
}: {
  staff: Staff[];
  loading: boolean;
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div data-testid="step-staff">
      <StepHeading title="აირჩიე სპეციალისტი" subtitle="ვინ შეასრულებს პროცედურას" />

      {loading && (
        <div className="flex items-center justify-center py-10 text-foreground/50">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          იტვირთება...
        </div>
      )}

      {!loading && staff.length === 0 && (
        <div className="text-center py-10 text-foreground/50 text-sm">
          ამ კატეგორიისთვის სპეციალისტი მიუწვდომელია.
        </div>
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
                  "press-tap w-full text-left rounded-[8px] border p-3.5 transition-all flex items-center gap-3.5",
                  isActive
                    ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/12"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
                )}
                data-testid={`staff-${s.id}`}
                aria-pressed={isActive}
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
                    isActive ? "bg-[var(--theme-accent)]/20" : "bg-white/5"
                  )}
                >
                  <User
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-[var(--theme-accent)]" : "text-foreground/70"
                    )}
                    strokeWidth={1.6}
                  />
                </div>
                <div className="flex-1 min-w-0">
              <div className="text-[15px] font-medium text-foreground leading-tight truncate">
                    {s.name}
                  </div>
                </div>
                {isActive && <Check className="w-5 h-5 text-[var(--theme-accent)] shrink-0" />}
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
}: {
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
  time: string;
  setTime: (t: string) => void;
  availableTimes: string[];
  hasAvailability: boolean;
}) {
  return (
    <div data-testid="step-datetime">
      <StepHeading title="როდის გერჩივნა?" subtitle="აირჩიე თარიღი და დრო" />

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "press-tap w-full rounded-[8px] border border-white/10 bg-white/[0.02] px-4 h-14 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.05]",
              date && "border-[var(--theme-accent)]/40 bg-[var(--theme-accent)]/10"
            )}
            data-testid="datetime-date-trigger"
          >
            <CalendarIcon className="w-5 h-5 text-foreground/60 shrink-0" strokeWidth={1.6} />
            <div className="flex-1">
              <div className="text-[10px] uppercase text-foreground/40 font-mono">
                თარიღი
              </div>
              <div className="text-[15px] text-foreground">
                {date ? format(date, "d MMMM, yyyy", { locale: ka }) : "აირჩიე თარიღი"}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-foreground/30" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-border bg-card backdrop-blur-xl"
          align="start"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={ka}
            disabled={(d) => isBefore(d, startOfToday())}
            className="rounded-none border-0"
          />
        </PopoverContent>
      </Popover>

      {date && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Clock className="w-4 h-4 text-foreground/50" strokeWidth={1.6} />
            <span className="text-[11px] uppercase text-foreground/50 font-mono">
              ხელმისაწვდომი დრო
            </span>
          </div>

          {!hasAvailability ? (
            <div className="text-sm text-foreground/50 py-4 text-center">იტვირთება...</div>
          ) : availableTimes.length === 0 ? (
            <div className="text-sm text-foreground/50 py-4 text-center">
              ამ თარიღზე სრულად დაჯავშნულია. სცადე სხვა დღე.
            </div>
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
                      "press-tap rounded-[8px] h-11 text-sm font-medium tabular-nums transition-colors",
                      isActive
                        ? "bg-[var(--theme-accent)] text-[var(--theme-on-accent)]"
                        : "bg-white/[0.04] text-foreground/80 hover:bg-white/[0.08] border border-white/10"
                    )}
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
}: {
  formData: {
    fullName: string;
    email: string;
    phone: string;
    serviceDetails: string;
    notes: string;
  };
  onChange: (patch: Partial<typeof formData>) => void;
}) {
  return (
    <div data-testid="step-details">
      <StepHeading title="ბოლო შეხება" subtitle="საკონტაქტო ინფორმაცია" />

      <div className="space-y-4">
        <FieldWithIcon Icon={User} label="სახელი და გვარი">
          <Input
            value={formData.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="თქვენი სახელი"
            className="bg-transparent border-0 p-0 h-auto text-[15px] text-foreground placeholder:text-foreground/30 focus-visible:ring-0"
            data-testid="input-full-name"
            required
          />
        </FieldWithIcon>

        <FieldWithIcon Icon={Mail} label="ელ. ფოსტა">
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="example@email.com"
            className="bg-transparent border-0 p-0 h-auto text-[15px] text-foreground placeholder:text-foreground/30 focus-visible:ring-0"
            data-testid="input-email"
            required
          />
        </FieldWithIcon>

        <FieldWithIcon Icon={PhoneIcon} label="ტელეფონი">
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+995 555 000 000"
            className="bg-transparent border-0 p-0 h-auto text-[15px] text-foreground placeholder:text-foreground/30 focus-visible:ring-0"
            data-testid="input-phone"
            required
          />
        </FieldWithIcon>

        <div className="rounded-[8px] border border-white/10 bg-white/[0.02] p-3.5">
          <Label className="text-[10px] uppercase text-foreground/40 font-mono mb-2 block">
            პროცედურის დეტალები
          </Label>
          <Textarea
            value={formData.serviceDetails}
            onChange={(e) => onChange({ serviceDetails: e.target.value })}
            placeholder="მიუთითე სასურველი პროცედურა..."
            className="bg-transparent border-0 p-0 min-h-[60px] text-[15px] text-foreground placeholder:text-foreground/30 focus-visible:ring-0 resize-none"
            data-testid="textarea-service-details"
            required
          />
        </div>

        <div className="rounded-[8px] border border-white/10 bg-white/[0.02] p-3.5">
          <Label className="text-[10px] uppercase text-foreground/40 font-mono mb-2 block">
            შენიშვნები (არასავალდებულო)
          </Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="სპეციალური სურვილები..."
            className="bg-transparent border-0 p-0 min-h-[50px] text-[15px] text-foreground placeholder:text-foreground/30 focus-visible:ring-0 resize-none"
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
    <div className="rounded-[8px] border border-white/10 bg-white/[0.02] p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-foreground/60" strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase text-foreground/40 font-mono">
          {label}
        </div>
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10px] uppercase text-foreground/40 font-mono">
        {label}
      </span>
      <span className="text-sm text-foreground text-right">{value || "—"}</span>
    </div>
  );
}
