import { useState, useMemo, useRef, useEffect, useLayoutEffect, type CSSProperties } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { Drawer as DrawerPrimitive } from "vaul";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CalendarIcon,
  CalendarPlus,
  Loader2,
  ShieldCheck,
  PencilLine,
  MessageSquarePlus,
  X,
  type LucideIcon,
} from "lucide-react";
import { addDays, format, isBefore, isSameDay, isToday, setHours, setMinutes, startOfToday } from "date-fns";
import { ka } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Wordmark from "@/components/Wordmark";
import InstallPrompt from "@/components/InstallPrompt";
import QuietStatus from "@/components/QuietStatus";
import { hapticTap, hapticSuccess, hapticWarning } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStudio, type Studio } from "@/lib/studio";
import { confirmationPromise } from "@/lib/studioFacts";
import { scrollBehavior } from "@/lib/motion";
import { PolishIcon, LotusIcon, BeamIcon, DropIcon, type StudioIconProps } from "@/components/StudioIcons";
import {
  BOOKING_REQUEST_EVENT,
  bookingCategories,
  bookingRef,
  treatmentsFor,
  usePriceMenu,
  type BookingCategory,
  type BookingRequest,
  type Treatment,
} from "@/lib/serviceMenu";
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
    tipKa: "24 საათის განმავლობაში მოერიდეთ ცხელ წყალს. ყოველდღე გამოიყენეთ კუტიკულის ზეთი.",
    titleEn: "Aftercare",
    tipEn: "Avoid hot water for 24 hours. Apply cuticle oil daily for a soft, polished finish.",
  },
  Pedicure: {
    titleKa: "მოვლის რჩევა",
    tipKa: "24 საათის განმავლობაში მოერიდეთ საუნას და აუზს. ყოველ საღამოს დაიტანეთ ფეხის დამატენიანებელი კრემი.",
    titleEn: "Aftercare",
    tipEn: "Skip the sauna and pool for 24 hours. Moisturize feet every evening.",
  },
  Epilation: {
    titleKa: "ლაზერის შემდგომი მოვლა",
    tipKa: "48 საათის განმავლობაში მოერიდეთ მზეს, საუნას და ცხელ შხაპს. დაიტანეთ დამამშვიდებელი ალოეს გელი.",
    titleEn: "Post-laser care",
    tipEn: "Avoid sun, sauna, and hot showers for 48 hours. Apply soothing aloe gel.",
  },
  Cosmetology: {
    titleKa: "პროცედურის შემდეგ",
    tipKa: "12 საათის განმავლობაში ნუ შეეხებით სახეს და ნუ გამოიყენებთ მაკიაჟს. დალიეთ მეტი წყალი.",
    titleEn: "After your treatment",
    tipEn: "Don't touch the area or apply makeup for 12 hours. Drink extra water for hydration.",
  },
};

const timeSlots = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30",
];

const dayPeriods = [
  { id: "morning", ka: "დილა", en: "Morning", matches: (min: number) => min < 12 * 60 },
  { id: "afternoon", ka: "შუადღე", en: "Afternoon", matches: (min: number) => min >= 12 * 60 && min < 17 * 60 },
  { id: "evening", ka: "საღამო", en: "Evening", matches: (min: number) => min >= 17 * 60 },
];

type ServiceOption = {
  value: BookingCategory;
  labelKa: string;
  labelEn: string;
  hint: string;
  Icon: (props: StudioIconProps) => JSX.Element;
};

const categoryIcons: Record<BookingCategory, ServiceOption["Icon"]> = {
  Manicure: PolishIcon,
  Pedicure: LotusIcon,
  Epilation: BeamIcon,
  Cosmetology: DropIcon,
};

const serviceCategories: ServiceOption[] = bookingCategories.map((c) => ({ ...c, Icon: categoryIcons[c.value] }));

/** "Not sure yet" — counts as a treatment choice and is exclusive. */
const CONSULT_KEY = "consult";
const QUICK_DAYS = 14;
const AUTO_ADVANCE_MS = 260;

/** Steps slide in the direction of travel; dir 0 (reduced motion) only fades. */
const stepVariants = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
};

type T = (ka: string, en: string) => string;
type Lang = "ka" | "en";

type ContactField = "fullName" | "phone" | "email";
type Contact = Record<ContactField, string>;

const contactFieldIds: Record<ContactField, string> = {
  fullName: "booking-full-name",
  phone: "booking-phone",
  email: "booking-email",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_MIN_DIGITS = 9;

function validateContact(c: Contact): Partial<Record<ContactField, true>> {
  const errors: Partial<Record<ContactField, true>> = {};
  if (c.fullName.trim().length < 2) errors.fullName = true;
  if (c.phone.replace(/\D/g, "").length < PHONE_MIN_DIGITS) errors.phone = true;
  if (!EMAIL_RE.test(c.email.trim())) errors.email = true;
  return errors;
}

/** Slots inside the next hour can't be booked any more. */
function isSlotPast(day: Date, time: string) {
  if (!isToday(day)) return false;
  const [h, m] = time.split(":").map(Number);
  const slot = setMinutes(setHours(new Date(day), h), m);
  return !isBefore(new Date(Date.now() + 60 * 60 * 1000), slot);
}

/** Bring a form field to the middle of the sheet: clear of the sticky footer and the phone keyboard. */
function revealField(el: Element | null) {
  const field = el?.closest(".float-field") ?? el;
  field?.scrollIntoView({ block: "center", behavior: scrollBehavior() });
}

function firstBookableDate() {
  const today = startOfToday();
  return timeSlots.some((slot) => !isSlotPast(today, slot)) ? today : addDays(today, 1);
}

function slotMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function readSavedUser(): Partial<Contact> {
  try {
    return JSON.parse(localStorage.getItem("mr_booking_user") || "{}");
  } catch {
    return {};
  }
}

type SubmittedData = {
  firstName: string;
  category: string;
  serviceLabel: string;
  treatmentsLabel: string;
  staffName: string;
  date: string;
  dateISO: string;
  time: string;
  confirmationCode: string;
};

type BookingFlow = ReturnType<typeof useBookingFlow>;

/** All booking state lives here so the sheet can close and reopen without losing progress. */
function useBookingFlow() {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const { menu } = usePriceMenu();
  const studio = useStudio();
  const [savedUser, setSavedUser] = useState(readSavedUser);

  const stepLabels = [t("სერვისი", "Service"), t("დრო", "Time"), t("დეტალები", "Details")];
  const totalSteps = stepLabels.length;

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [category, setCategory] = useState<BookingCategory | "">("");
  const [picked, setPicked] = useState<string[]>([]);
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState<Date>(firstBookableDate);
  const [time, setTime] = useState("");
  const [contact, setContact] = useState<Contact>({
    fullName: savedUser.fullName || "",
    phone: savedUser.phone || "",
    email: savedUser.email || "",
  });
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedData | null>(null);

  const advanceTimer = useRef<number>();
  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const { data: availableStaff = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff/category", category],
    queryFn: async () => {
      const response = await fetch(`/api/staff/category/${category}`);
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    },
    enabled: !!category,
  });

  // One specialist per service is the norm — assign them instead of asking.
  useEffect(() => {
    if (staffLoading) return;
    if (availableStaff.length === 1) {
      if (staffId !== availableStaff[0].id) setStaffId(availableStaff[0].id);
    } else if (staffId && !availableStaff.some((s) => s.id === staffId)) {
      setStaffId("");
    }
  }, [availableStaff, staffLoading, staffId]);

  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: availabilityData } = useQuery<{ bookedTimes: string[] }>({
    queryKey: ["/api/bookings/availability", formattedDate, staffId],
    queryFn: async () => {
      const response = await fetch(
        `/api/bookings/availability?date=${formattedDate}&staffId=${staffId}`
      );
      if (!response.ok) throw new Error("Failed to fetch availability");
      return response.json();
    },
    enabled: !!staffId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const slots = useMemo(() => {
    const booked = new Set(availabilityData?.bookedTimes ?? []);
    return timeSlots
      .filter((slot) => !isSlotPast(date, slot))
      .map((slot) => ({ time: slot, booked: booked.has(slot) }));
  }, [availabilityData, date]);

  // A refetch can take the chosen slot away — don't keep a stale selection.
  useEffect(() => {
    if (time && slots.some((s) => s.time === time && s.booked)) setTime("");
  }, [slots, time]);

  const treatments = useMemo(() => (category ? treatmentsFor(menu, category) : []), [menu, category]);
  const multiGroup = useMemo(() => new Set(treatments.map((tr) => tr.groupId)).size > 1, [treatments]);
  const pickedTreatments = treatments.filter((tr) => picked.includes(tr.key));
  const wantsConsult = picked.includes(CONSULT_KEY);

  const treatmentName = (tr: Treatment) => {
    const name = lang === "ka" ? tr.nameKa : tr.name;
    return multiGroup ? `${name} · ${lang === "ka" ? tr.groupKa : tr.groupEn}` : name;
  };

  const categoryOption = serviceCategories.find((c) => c.value === category);
  const categoryLabel = categoryOption ? (lang === "ka" ? categoryOption.labelKa : categoryOption.labelEn) : "";
  const treatmentsLabel = [
    ...pickedTreatments.map(treatmentName),
    ...(wantsConsult ? [t("კონსულტაცია", "Consultation")] : []),
  ].join(", ");
  const selectedStaff = availableStaff.find((s) => s.id === staffId);
  const dateLocale = lang === "ka" ? ka : undefined;
  const dateLabel = format(date, "EEEE, d MMMM", { locale: dateLocale });

  const canContinue =
    step === 1 ? !!category && picked.length > 0 && !!staffId : step === 2 ? !!time : true;

  const errors = validateContact(contact);
  const showError = (field: ContactField) => !!errors[field] && (!!touched[field] || submitAttempted);

  const goTo = (next: number) => {
    window.clearTimeout(advanceTimer.current);
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const goNext = () => {
    if (!canContinue) {
      hapticWarning();
      return;
    }
    hapticTap();
    goTo(Math.min(totalSteps, step + 1));
  };

  const goBack = () => {
    hapticTap();
    goTo(Math.max(1, step - 1));
  };

  const selectCategory = (value: BookingCategory) => {
    hapticTap();
    if (value === category) return;
    setCategory(value);
    setPicked([]);
    setStaffId("");
    setTime("");
  };

  const toggleTreatment = (key: string) => {
    hapticTap();
    setPicked((prev) => {
      if (key === CONSULT_KEY) return prev.includes(CONSULT_KEY) ? [] : [CONSULT_KEY];
      const rest = prev.filter((k) => k !== CONSULT_KEY);
      return rest.includes(key) ? rest.filter((k) => k !== key) : [...rest, key];
    });
  };

  const selectStaff = (id: string) => {
    hapticTap();
    setStaffId(id);
    setTime("");
  };

  const selectDate = (next: Date | undefined) => {
    if (!next) return;
    hapticTap();
    setDate(next);
    setTime("");
  };

  const selectTime = (slot: string) => {
    hapticTap();
    setTime(slot);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      setDirection(1);
      setStep(3);
    }, AUTO_ADVANCE_MS);
  };

  const reset = () => {
    window.clearTimeout(advanceTimer.current);
    setSubmitted(null);
    setDirection(1);
    setStep(1);
    setCategory("");
    setPicked([]);
    setStaffId("");
    setDate(firstBookableDate());
    setTime("");
    setNotes("");
    setTouched({});
    setSubmitAttempted(false);
  };

  /** Pre-select a service (and treatment) — from the price list, a shortcut, etc. */
  const applyRequest = (request: BookingRequest) => {
    window.clearTimeout(advanceTimer.current);
    setSubmitted(null);
    if (request.category !== category) {
      setStaffId("");
      setTime("");
    }
    setCategory(request.category);
    setPicked(request.treatmentKey ? [request.treatmentKey] : []);
    setDirection(-1);
    setStep(1);
  };

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: Record<string, unknown>) =>
      apiRequest("POST", "/api/bookings", bookingData),
    onSuccess: async (booking: { id?: string }) => {
      setSubmitted({
        firstName: contact.fullName.trim().split(/\s+/)[0] || "",
        category,
        serviceLabel: categoryLabel,
        treatmentsLabel,
        staffName: selectedStaff?.name || "",
        date: format(date, "d MMMM, yyyy", { locale: dateLocale }),
        dateISO: formattedDate,
        time,
        confirmationCode: booking?.id ? bookingRef(booking.id) : "",
      });
      hapticSuccess();

      const remembered = {
        fullName: contact.fullName.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
      };
      setSavedUser(remembered);
      try {
        localStorage.setItem("mr_booking_user", JSON.stringify(remembered));
      } catch {
        /* storage unavailable — nothing to remember */
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/bookings/availability"] });
    },
    onError: () => {
      hapticWarning();
      toast({
        title: t("დაჯავშნა ვერ მოხერხდა", "Booking failed"),
        description: t(
          "გთხოვთ სცადოთ ხელახლა ან მოგვწერეთ WhatsApp-ზე.",
          "Please try again, or message us on WhatsApp."
        ),
        variant: "destructive",
      });
    },
  });

  const submit = () => {
    setSubmitAttempted(true);
    const firstInvalid = (["fullName", "phone", "email"] as ContactField[]).find((f) => errors[f]);
    if (firstInvalid) {
      hapticWarning();
      document.getElementById(contactFieldIds[firstInvalid])?.focus();
      return;
    }

    // The studio works in Georgian, so the admin sees Georgian treatment names.
    const treatmentsForAdmin = [
      ...pickedTreatments.map((tr) => (multiGroup ? `${tr.nameKa} (${tr.groupKa})` : tr.nameKa)),
      ...(wantsConsult ? ["კონსულტაცია"] : []),
    ].join(", ");

    createBookingMutation.mutate({
      fullName: contact.fullName.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      service: `${categoryOption?.labelEn || ""}: ${treatmentsForAdmin}`,
      staffId,
      staffName: selectedStaff?.name || "",
      date: formattedDate,
      time,
      notes: notes.trim() || null,
    });
  };

  const forgetSavedUser = () => {
    hapticTap();
    setSavedUser({});
    setContact({ fullName: "", phone: "", email: "" });
    try {
      localStorage.removeItem("mr_booking_user");
    } catch {
      /* noop */
    }
  };

  const priceTotal = pickedTreatments.reduce(
    (sum, tr) => sum + (typeof tr.price === "number" ? tr.price : 0),
    0
  );
  const priceLabel = wantsConsult
    ? t("კონსულტაციის შემდეგ", "After consultation")
    : pickedTreatments.length
      ? `${priceTotal} ₾`
      : "";

  const hint = !category
    ? t("აირჩიეთ სერვისი", "Choose a service")
    : picked.length === 0
      ? t("მონიშნეთ პროცედურა", "Pick a treatment")
      : !staffId
        ? staffLoading
          ? t("სპეციალისტის ძებნა…", "Finding your specialist…")
          : t("აირჩიეთ სპეციალისტი", "Choose a specialist")
        : wantsConsult
          ? t("კონსულტაცია", "Consultation")
          : t(`არჩეულია ${picked.length}`, `${picked.length} selected`);

  return {
    t,
    lang,
    stepLabels,
    totalSteps,
    studio,
    step,
    direction,
    category,
    picked,
    staffId,
    date,
    time,
    contact,
    setContact,
    notes,
    setNotes,
    setTouched,
    submitted,
    savedUser,
    availableStaff,
    staffLoading,
    availabilityLoaded: !!availabilityData,
    slots,
    treatments,
    multiGroup,
    categoryLabel,
    treatmentsLabel,
    selectedStaff,
    dateLabel,
    canContinue,
    showError,
    isSubmitting: createBookingMutation.isPending,
    hint,
    priceLabel,
    firstName: contact.fullName.trim().split(/\s+/)[0] || "",
    goTo,
    goNext,
    goBack,
    selectCategory,
    toggleTreatment,
    selectStaff,
    selectDate,
    selectTime,
    submit,
    reset,
    applyRequest,
    forgetSavedUser,
  };
}

/* -------------- The sheet: booking from anywhere -------------- */

/**
 * Loaded on demand by BookingLauncher. When the load was triggered by a "Book"
 * tap, `openOnMount` replays it (with its pre-selected service, if any).
 */
export default function BookingSheet({
  openOnMount = false,
  initialRequest,
}: {
  openOnMount?: boolean;
  initialRequest?: BookingRequest;
}) {
  const flow = useBookingFlow();
  const { t } = flow;
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const lenis = useLenis();
  const bodyRef = useRef<HTMLDivElement>(null);
  const revealKey = useRef<string | null>(null);

  // Handlers read the latest flow without re-subscribing on every render.
  const flowRef = useRef(flow);
  flowRef.current = flow;

  useEffect(() => {
    const onRequest = (event: Event) => {
      const detail = (event as CustomEvent<BookingRequest | undefined>).detail;
      const current = flowRef.current;
      if (detail?.category) current.applyRequest(detail);
      else if (current.submitted) current.reset();
      revealKey.current = detail?.treatmentKey ?? null;
      setOpen(true);
    };
    window.addEventListener(BOOKING_REQUEST_EVENT, onRequest);
    if (openOnMount) {
      onRequest(new CustomEvent(BOOKING_REQUEST_EVENT, { detail: initialRequest }));
    }
    return () => window.removeEventListener(BOOKING_REQUEST_EVENT, onRequest);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // The page shouldn't smooth-scroll underneath an open sheet.
  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  // Each step starts at the top of the sheet.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: scrollBehavior() });
  }, [flow.step, flow.submitted]);

  // After a "Book this" handoff, show the ticked treatment.
  useEffect(() => {
    if (!open || !revealKey.current) return;
    const timer = window.setTimeout(() => {
      const row = bodyRef.current?.querySelector(`[data-testid="treatment-${revealKey.current}"]`);
      row?.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      revealKey.current = null;
    }, 420);
    return () => window.clearTimeout(timer);
  }, [open, flow.category]);

  const side = isMobile ? "bottom" : "right";

  const keyboardTimer = useRef<number>();

  // Phones: the keyboard covers the lower half of the sheet. Once it has opened (or after
  // focus moves), re-centre the focused field so the client can see what she types.
  const keepFieldInView = () => {
    if (side !== "bottom") return;
    window.clearTimeout(keyboardTimer.current);
    keyboardTimer.current = window.setTimeout(() => {
      const el = document.activeElement;
      if (el && bodyRef.current?.contains(el) && el.matches("input, textarea")) revealField(el);
    }, 320);
  };
  useEffect(() => {
    const vv = window.visualViewport;
    if (!open || !vv) return;
    vv.addEventListener("resize", keepFieldInView);
    return () => {
      vv.removeEventListener("resize", keepFieldInView);
      window.clearTimeout(keyboardTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, side]);
  const showCard = side === "right" && !flow.submitted;

  return (
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={setOpen}
      direction={side}
      shouldScaleBackground={false}
      autoFocus
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="booking-sheet-overlay" />
        <DrawerPrimitive.Content
          className="booking-sheet"
          data-side={side}
          data-wide={showCard}
          style={side === "right" ? ({ "--initial-transform": "calc(100% + 16px)" } as CSSProperties) : undefined}
          data-testid="booking-sheet"
        >
          <div className="booking-sheet-header">
            {side === "bottom" && <div className="booking-sheet-handle" aria-hidden />}
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <DrawerPrimitive.Title className="booking-sheet-title">
                  {t("ვიზიტის დაჯავშნა", "Book your visit")}
                </DrawerPrimitive.Title>
              </div>
              <DrawerPrimitive.Close
                className="booking-sheet-close press-tap"
                aria-label={t("დახურვა", "Close")}
                data-testid="booking-sheet-close"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </DrawerPrimitive.Close>
            </div>
            <DrawerPrimitive.Description className="sr-only">
              {t(
                "აირჩიეთ სერვისი და დრო, შემდეგ დაგვიტოვეთ საკონტაქტო მონაცემები.",
                "Choose a service and a time, then leave your contact details."
              )}
            </DrawerPrimitive.Description>
          </div>

          <div className="booking-sheet-columns">
            <div className="booking-sheet-flow">
              {!flow.submitted && (
                <BookingStepper t={t} labels={flow.stepLabels} step={flow.step} onJump={flow.goTo} />
              )}

              <div ref={bodyRef} className="booking-sheet-body" data-lenis-prevent onFocus={keepFieldInView}>
                <BookingFlowBody flow={flow} onDone={() => setOpen(false)} />
              </div>

              {!flow.submitted && <BookingActions flow={flow} />}
            </div>

            {showCard && <AppointmentCard flow={flow} />}
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}

/** Desktop: the appointment fills in live as she chooses. */
function AppointmentCard({ flow }: { flow: BookingFlow }) {
  const { t, lang, studio } = flow;
  const dateChosen = flow.step > 1 || !!flow.time;
  const dateLocale = lang === "ka" ? ka : undefined;
  const rows = [
    { label: t("სერვისი", "Service"), value: flow.categoryLabel },
    { label: t("პროცედურა", "Treatment"), value: flow.treatmentsLabel },
    { label: t("სპეციალისტი", "Specialist"), value: flow.selectedStaff?.name || "" },
    { label: t("სავარაუდო ფასი", "Price · estimate"), value: flow.priceLabel },
  ];

  return (
    <aside className="appointment-card" aria-label={t("თქვენი ვიზიტი", "Your appointment")} aria-live="polite">
      <p className="eyebrow">{t("თქვენი ვიზიტი", "Your appointment")}</p>

      <div className="appointment-when" data-empty={!dateChosen || undefined}>
        {dateChosen ? (
          <>
            <span className="appointment-date first-letter:uppercase">
              {format(flow.date, "EEEE, d MMMM", { locale: dateLocale })}
            </span>
            <span className="appointment-time">{flow.time || "—"}</span>
          </>
        ) : (
          <span className="appointment-date">{t("დრო ჯერ არ არის არჩეული", "No time chosen yet")}</span>
        )}
      </div>

      <dl className="appointment-rows">
        {rows.map((row) => (
          <div key={row.label} className="appointment-row">
            <dt>{row.label}</dt>
            <dd key={row.value || "empty"} data-empty={!row.value || undefined}>
              {row.value || "—"}
            </dd>
          </div>
        ))}
      </dl>

      <div className="appointment-foot">
        <p>{noPrepaymentLine(t)}</p>
        <p className="appointment-address">{lang === "ka" ? studio.address.ka : studio.address.en}</p>
        <a
          href={studio.whatsappLink(t("გამარჯობა! დაჯავშნაზე მაქვს კითხვა.", "Hi, I have a question about booking."))}
          target="_blank"
          rel="noopener noreferrer"
          className="link-line"
        >
          {t("გაქვთ კითხვა? მოგვწერეთ WhatsApp-ზე", "Questions? Message us on WhatsApp")}
        </a>
      </div>
    </aside>
  );
}

/** "No prepayment. The confirmation comes by email {within X hours}." */
function noPrepaymentLine(t: T) {
  const when = confirmationPromise;
  return t(
    `წინასწარი გადახდა არ არის საჭირო. დადასტურებას ${when ? `${when.ka} ` : ""}ელ. ფოსტით მიიღებთ.`,
    `No prepayment. We'll confirm by email${when ? ` ${when.en}` : ""}.`
  );
}

function BookingFlowBody({ flow, onDone }: { flow: BookingFlow; onDone: () => void }) {
  const { t, lang } = flow;
  const slide = useReducedMotion() ? 0 : flow.direction;
  return (
    <AnimatePresence mode="wait" custom={slide} initial={false}>
      {flow.submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <InvitationCard
            data={flow.submitted}
            onAddToCalendar={() => flow.submitted && downloadIcs(flow.submitted, flow.studio.address.ka)}
            onBookAnother={flow.reset}
            onDone={onDone}
            studio={flow.studio}
            t={t}
            lang={lang}
          />
        </motion.div>
      ) : (
        <motion.div
          key={flow.step}
          custom={slide}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {flow.step === 1 && (
            <StepService
              t={t}
              lang={lang}
              category={flow.category}
              onSelectCategory={flow.selectCategory}
              treatments={flow.treatments}
              multiGroup={flow.multiGroup}
              picked={flow.picked}
              onToggle={flow.toggleTreatment}
              staff={flow.availableStaff}
              staffLoading={flow.staffLoading}
              staffId={flow.staffId}
              onSelectStaff={flow.selectStaff}
            />
          )}

          {flow.step === 2 && (
            <StepTime
              t={t}
              lang={lang}
              date={flow.date}
              dateLabel={flow.dateLabel}
              onSelectDate={flow.selectDate}
              time={flow.time}
              onSelectTime={flow.selectTime}
              slots={flow.slots}
              loading={!flow.availabilityLoaded}
            />
          )}

          {flow.step === 3 && (
            <StepDetails
              t={t}
              summary={{
                service: [flow.categoryLabel, flow.selectedStaff?.name].filter(Boolean).join(" · "),
                treatments: flow.treatmentsLabel,
                when: flow.dateLabel,
                time: flow.time,
              }}
              onEdit={flow.goTo}
              contact={flow.contact}
              onChange={(patch) => flow.setContact((c) => ({ ...c, ...patch }))}
              onBlur={(field) => flow.setTouched((p) => ({ ...p, [field]: true }))}
              showError={flow.showError}
              notes={flow.notes}
              onNotesChange={flow.setNotes}
              savedName={flow.savedUser.fullName || ""}
              onForgetSaved={flow.forgetSavedUser}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BookingActions({ flow }: { flow: BookingFlow }) {
  const { t } = flow;
  return (
    <div className="booking-sheet-footer">
      {flow.step === 1 ? (
        <span className="booking-action-hint" aria-live="polite">
          {flow.hint}
        </span>
      ) : (
        <button
          type="button"
          onClick={flow.goBack}
          className="booking-back-button press-tap"
          data-testid="button-step-back"
          aria-label={t("უკან", "Back")}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}

      <div className="flex-1" />

      {flow.step < flow.totalSteps ? (
        <button
          type="button"
          onClick={flow.goNext}
          disabled={!flow.canContinue}
          className="pill-primary flex-1 max-w-[240px] whitespace-nowrap"
          data-testid="button-step-next"
        >
          {t("გაგრძელება", "Continue")}
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={flow.submit}
          disabled={flow.isSubmitting}
          className="pill-primary flex-1 max-w-[260px] whitespace-nowrap"
          data-testid="button-confirm-booking"
        >
          {flow.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("იგზავნება…", "Sending…")}
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {t("დაჯავშნა", "Confirm booking")}
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* -------------- Frame -------------- */

function BookingStepper({
  t,
  labels,
  step,
  onJump,
}: {
  t: T;
  labels: string[];
  step: number;
  onJump: (step: number) => void;
}) {
  return (
    <ol className="booking-stepper" aria-label={t("დაჯავშნის ნაბიჯები", "Booking steps")}>
      {labels.map((label, index) => {
        const number = index + 1;
        const isDone = number < step;
        const isActive = number === step;
        return (
          <li key={label} className="min-w-0">
            <button
              type="button"
              className="booking-stepper-item"
              data-active={isActive}
              data-done={isDone}
              disabled={!isDone}
              onClick={() => {
                hapticTap();
                onJump(number);
              }}
              aria-current={isActive ? "step" : undefined}
              data-testid={`stepper-${number}`}
            >
              <span className="booking-stepper-bar" aria-hidden />
              <span className="booking-stepper-label">
                <span className="booking-stepper-num">
                  {isDone ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : number}
                </span>
                <span className="truncate">{label}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
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

function BlockLabel({ children, aside }: { children: React.ReactNode; aside?: string }) {
  return (
    <div className="booking-block-label">
      <span>{children}</span>
      {aside && <em>{aside}</em>}
    </div>
  );
}

/* -------------- Step 1: service -------------- */

function StepService({
  t,
  lang,
  category,
  onSelectCategory,
  treatments,
  multiGroup,
  picked,
  onToggle,
  staff,
  staffLoading,
  staffId,
  onSelectStaff,
}: {
  t: T;
  lang: Lang;
  category: string;
  onSelectCategory: (value: BookingCategory) => void;
  treatments: Treatment[];
  multiGroup: boolean;
  picked: string[];
  onToggle: (key: string) => void;
  staff: Staff[];
  staffLoading: boolean;
  staffId: string;
  onSelectStaff: (id: string) => void;
}) {
  const groups = useMemo(() => {
    const byGroup = new Map<string, Treatment[]>();
    for (const tr of treatments) byGroup.set(tr.groupId, [...(byGroup.get(tr.groupId) ?? []), tr]);
    return Array.from(byGroup.values());
  }, [treatments]);

  return (
    <div data-testid="step-service">
      <StepHeading
        title={t("აირჩიეთ სერვისი", "What would you like?")}
        subtitle={t("შემდეგ მონიშნეთ პროცედურა", "Choose a service, then the treatment")}
      />

      <div className="grid grid-cols-2 gap-2.5">
        {serviceCategories.map(({ value, labelKa, labelEn, hint, Icon }) => {
          const isActive = category === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelectCategory(value)}
              className="booking-choice-card booking-category press-tap"
              data-active={isActive}
              data-testid={`category-${value}`}
              aria-pressed={isActive}
            >
              <span className="studio-seal" aria-hidden>
                <Icon />
              </span>
              <span className="min-w-0 w-full">
                <span className="block text-[14px] font-semibold text-[var(--theme-text)] leading-tight">
                  {lang === "ka" ? labelKa : labelEn}
                </span>
                {lang === "ka" && (
                  <span className="block text-[11px] text-[var(--theme-muted1)]/80 mt-0.5">{hint}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {category && (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5"
          >
            <BlockLabel aside={t("შეგიძლიათ აირჩიოთ რამდენიმე", "Pick one or more")}>
              {t("პროცედურა", "Treatment")}
            </BlockLabel>

            <div className="app-list booking-treatment-list" role="group">
              {groups.map((group) => (
                <div key={group[0].groupId} className="contents">
                  {multiGroup && (
                    <div className="booking-group-label">
                      {lang === "ka" ? group[0].groupKa : group[0].groupEn}
                    </div>
                  )}
                  {group.map((tr) => (
                    <TreatmentRow
                      key={tr.key}
                      active={picked.includes(tr.key)}
                      onClick={() => onToggle(tr.key)}
                      title={lang === "ka" ? tr.nameKa : tr.name}
                      subtitle={lang === "ka" ? tr.name : undefined}
                      price={tr.price}
                      testId={`treatment-${tr.key}`}
                    />
                  ))}
                </div>
              ))}
              <TreatmentRow
                active={picked.includes(CONSULT_KEY)}
                onClick={() => onToggle(CONSULT_KEY)}
                title={t("ჯერ არ ვიცი — მჭირდება კონსულტაცია", "Not sure yet — I'd like advice")}
                subtitle={t("სპეციალისტი დაგეხმარებათ არჩევაში", "Your specialist will help you choose")}
                testId="treatment-consult"
              />
            </div>

            <div className="mt-4">
              {staffLoading ? (
                <QuietStatus label={t("სპეციალისტის ძებნა…", "Finding your specialist…")} className="!py-4" />
              ) : staff.length === 0 ? (
                <QuietStatus
                  label={t(
                    "ამ სერვისზე თავისუფალი სპეციალისტი ახლა არ გვყავს — მოგვწერეთ WhatsApp-ზე.",
                    "No specialist is free for this service — message us on WhatsApp."
                  )}
                  className="!py-4"
                />
              ) : staff.length === 1 ? (
                <div className="booking-staff-line" data-testid="staff-auto">
                  <span className="booking-avatar" aria-hidden>
                    {staff[0].name.slice(0, 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11.5px] text-[var(--theme-muted1)]">
                      {t("თქვენი სპეციალისტი", "Your specialist")}
                    </span>
                    <span className="block text-[14.5px] font-semibold text-[var(--theme-text)] truncate">
                      {staff[0].name}
                    </span>
                  </span>
                  <Check className="ml-auto h-4 w-4 text-[var(--theme-accent)]" />
                </div>
              ) : (
                <>
                  <BlockLabel>{t("სპეციალისტი", "Specialist")}</BlockLabel>
                  <div className="flex flex-wrap gap-2">
                    {staff.map((s) => {
                      const isActive = staffId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onSelectStaff(s.id)}
                          className="booking-staff-chip press-tap"
                          data-active={isActive}
                          aria-pressed={isActive}
                          data-testid={`staff-${s.id}`}
                        >
                          <span className="booking-avatar booking-avatar--sm" aria-hidden>
                            {s.name.slice(0, 1)}
                          </span>
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TreatmentRow({
  active,
  onClick,
  title,
  subtitle,
  price,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  price?: number | string;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="booking-treatment press-tap"
      data-active={active}
      aria-pressed={active}
      data-testid={testId}
    >
      <span className="booking-check" aria-hidden>
        {active && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-medium text-[var(--theme-text)] leading-snug">
          {title}
        </span>
        {subtitle && (
          <span className="block text-[11.5px] text-[var(--theme-muted1)]/85 mt-0.5 leading-snug">
            {subtitle}
          </span>
        )}
      </span>
      {price !== undefined && (
        <span className="shrink-0 tabular-nums text-[14px] font-semibold text-[var(--theme-text)]">
          {price}
          <span className="ml-0.5 text-[11.5px] font-normal text-[var(--theme-muted1)]">₾</span>
        </span>
      )}
    </button>
  );
}

/* -------------- Step 2: date & time -------------- */

function StepTime({
  t,
  lang,
  date,
  dateLabel,
  onSelectDate,
  time,
  onSelectTime,
  slots,
  loading,
}: {
  t: T;
  lang: Lang;
  date: Date;
  dateLabel: string;
  onSelectDate: (d: Date | undefined) => void;
  time: string;
  onSelectTime: (slot: string) => void;
  slots: { time: string; booked: boolean }[];
  loading: boolean;
}) {
  const dateLocale = lang === "ka" ? ka : undefined;
  const quickDates = useMemo(() => {
    const first = firstBookableDate();
    return Array.from({ length: QUICK_DAYS }, (_, index) => addDays(first, index));
  }, []);
  const pickedFromCalendar = !quickDates.some((d) => isSameDay(d, date));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  // Keep the chosen day visible in the rail (e.g. after picking it from the calendar).
  useEffect(() => {
    const rail = railRef.current;
    const active = rail?.querySelector<HTMLElement>('[data-active="true"]');
    if (!rail || !active) return;
    const target = active.offsetLeft - (rail.clientWidth - active.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: scrollBehavior() });
  }, [date]);

  const periods = dayPeriods
    .map((period) => ({ ...period, slots: slots.filter((s) => period.matches(slotMinutes(s.time))) }))
    .filter((period) => period.slots.length > 0);
  const allBooked = slots.length > 0 && slots.every((s) => s.booked);

  return (
    <div data-testid="step-datetime">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[18px] font-semibold text-[var(--theme-text)] tracking-[-0.01em]">
            {t("აირჩიეთ დღე და დრო", "When suits you?")}
          </h3>
          <p className="text-[13px] text-[var(--theme-muted1)] mt-0.5 first-letter:uppercase">{dateLabel}</p>
        </div>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="booking-calendar-button press-tap" data-testid="datetime-date-trigger">
              <CalendarIcon className="h-4 w-4" strokeWidth={1.7} />
              {t("კალენდარი", "Calendar")}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="z-[120] w-auto p-0 rounded-[var(--radius-m)] border border-[var(--theme-line)]/70 bg-[var(--theme-surface)] shadow-[var(--shadow-overlay)]"
            align="end"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                onSelectDate(d);
                setCalendarOpen(false);
              }}
              initialFocus
              locale={dateLocale}
              disabled={(d) => isBefore(d, startOfToday())}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div ref={railRef} className="booking-date-rail scrollbar-hide" aria-label={t("თარიღები", "Dates")}>
        {pickedFromCalendar && (
          <button
            type="button"
            className="booking-date-chip press-tap"
            data-active="true"
            aria-pressed="true"
            onClick={() => setCalendarOpen(true)}
          >
            <span>{format(date, "EEE", { locale: dateLocale })}</span>
            <strong>{format(date, "d")}</strong>
            <em>{format(date, "MMM", { locale: dateLocale })}</em>
          </button>
        )}
        {quickDates.map((quickDate, index) => {
          const isActive = isSameDay(date, quickDate);
          const dayLabel = isToday(quickDate)
            ? t("დღეს", "Today")
            : index <= 1 && isSameDay(quickDate, addDays(startOfToday(), 1))
              ? t("ხვალ", "Tomorrow")
              : format(quickDate, "EEE", { locale: dateLocale });

          return (
            <button
              key={quickDate.toISOString()}
              type="button"
              onClick={() => onSelectDate(quickDate)}
              className="booking-date-chip press-tap"
              data-active={isActive}
              aria-pressed={isActive}
              aria-label={format(quickDate, "EEEE, d MMMM", { locale: dateLocale })}
              data-testid={`date-quick-${index}`}
            >
              <span>{dayLabel}</span>
              <strong>{format(quickDate, "d")}</strong>
              <em>{format(quickDate, "MMM", { locale: dateLocale })}</em>
            </button>
          );
        })}
      </div>

      <div className="mt-2">
        {loading ? (
          <QuietStatus label={t("კალენდრის ჩატვირთვა…", "Reading the calendar…")} className="!py-6" />
        ) : slots.length === 0 || allBooked ? (
          <div className="booking-day-full">
            <p>
              {t("ეს დღე სრულად დაკავებულია.", "This day is fully booked.")}
            </p>
            <button
              type="button"
              onClick={() => onSelectDate(addDays(date, 1))}
              className="booking-calendar-button press-tap"
              data-testid="button-next-day"
            >
              {t("შემდეგი დღე", "Next day")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {periods.map((period) => {
              const free = period.slots.filter((s) => !s.booked).length;
              return (
                <div key={period.id}>
                  <BlockLabel aside={t(`${free} თავისუფალი`, `${free} free`)}>
                    {lang === "ka" ? period.ka : period.en}
                  </BlockLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {period.slots.map((slot) => {
                      const isActive = time === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => onSelectTime(slot.time)}
                          disabled={slot.booked}
                          className="booking-time-chip press-tap"
                          data-active={isActive}
                          aria-pressed={isActive}
                          aria-label={
                            slot.booked ? `${slot.time} — ${t("დაკავებულია", "booked")}` : slot.time
                          }
                          data-testid={`time-${slot.time}`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------- Step 3: details -------------- */

function StepDetails({
  t,
  summary,
  onEdit,
  contact,
  onChange,
  onBlur,
  showError,
  notes,
  onNotesChange,
  savedName,
  onForgetSaved,
}: {
  t: T;
  summary: { service: string; treatments: string; when: string; time: string };
  onEdit: (step: number) => void;
  contact: Contact;
  onChange: (patch: Partial<Contact>) => void;
  onBlur: (field: ContactField) => void;
  showError: (field: ContactField) => boolean;
  notes: string;
  onNotesChange: (value: string) => void;
  savedName: string;
  onForgetSaved: () => void;
}) {
  const [notesOpen, setNotesOpen] = useState(!!notes);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const justOpenedNotes = useRef(false);

  // Opening the note: focus it (still inside the tap, so phones open the keyboard)
  // and bring the whole field into view — it sits right above the sticky footer.
  useLayoutEffect(() => {
    if (!notesOpen || !justOpenedNotes.current) return;
    justOpenedNotes.current = false;
    notesRef.current?.focus({ preventScroll: true });
    revealField(notesRef.current);
  }, [notesOpen]);
  const isReturning = !!savedName && contact.fullName === savedName;

  return (
    <div data-testid="step-details">
      <StepHeading
        title={t("თითქმის მზადაა", "Almost there")}
        subtitle={t("გადაამოწმეთ ვიზიტი და დაგვიტოვეთ საკონტაქტო მონაცემები", "Check your visit and leave your contact")}
      />

      <div className="booking-review" data-testid="booking-review">
        <ReviewRow
          label={t("ვიზიტი", "Visit")}
          title={summary.service}
          detail={summary.treatments}
          editLabel={t("შეცვლა", "Change")}
          onEdit={() => onEdit(1)}
        />
        <ReviewRow
          label={t("დრო", "When")}
          title={summary.when}
          detail={summary.time}
          editLabel={t("შეცვლა", "Change")}
          onEdit={() => onEdit(2)}
        />
      </div>

      {isReturning && (
        <div className="booking-welcome">
          <span>
            {t(
              `გამარჯობა, ${savedName.split(" ")[0]}! მონაცემები უკვე შევსებულია.`,
              `Welcome back, ${savedName.split(" ")[0]} — your details are filled in.`
            )}
          </span>
          <button type="button" onClick={onForgetSaved} className="booking-welcome-reset">
            {t("მონაცემების შეცვლა", "Not you?")}
          </button>
        </div>
      )}

      <div className="booking-fields">
        <FloatingField
          id={contactFieldIds.fullName}
          label={t("სახელი და გვარი", "Full name")}
          error={showError("fullName") ? t("გთხოვთ, ჩაწეროთ სახელი.", "Please add your name.") : undefined}
        >
          <input
            id={contactFieldIds.fullName}
            className="float-input"
            autoComplete="name"
            enterKeyHint="next"
            value={contact.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            onBlur={() => onBlur("fullName")}
            placeholder={t("მაგ. ნინო ბერიძე", "e.g. Nino Beridze")}
            aria-invalid={showError("fullName")}
            data-testid="input-full-name"
          />
        </FloatingField>

        <FloatingField
          id={contactFieldIds.phone}
          label={t("ტელეფონი", "Phone")}
          error={
            showError("phone")
              ? t("ნომერი სრულად ჩაწერეთ, მაგ. 555 12 34 56.", "Please add the full number, e.g. 555 12 34 56.")
              : undefined
          }
        >
          <input
            id={contactFieldIds.phone}
            className="float-input tabular-nums"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="next"
            value={contact.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            onBlur={() => onBlur("phone")}
            placeholder="+995 555 12 34 56"
            aria-invalid={showError("phone")}
            data-testid="input-phone"
          />
        </FloatingField>

        <FloatingField
          id={contactFieldIds.email}
          label={t("ელ. ფოსტა (დადასტურებისთვის)", "Email · for your confirmation")}
          error={showError("email") ? t("შეამოწმეთ ელ. ფოსტის მისამართი.", "That email doesn't look complete yet.") : undefined}
        >
          <input
            id={contactFieldIds.email}
            className="float-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            enterKeyHint="done"
            value={contact.email}
            onChange={(e) => onChange({ email: e.target.value })}
            onBlur={() => onBlur("email")}
            placeholder="name@example.com"
            aria-invalid={showError("email")}
            data-testid="input-email"
          />
        </FloatingField>

        {notesOpen ? (
          <FloatingField id="booking-notes" label={t("შენიშვნა (არასავალდებულო)", "Note · optional")}>
            <textarea
              ref={notesRef}
              id="booking-notes"
              className="float-input float-textarea"
              rows={3}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder={t("მაგ. სასურველი ფერი ან დიზაინი", "e.g. a colour or design you have in mind")}
              data-testid="textarea-notes"
            />
          </FloatingField>
        ) : (
          <button
            type="button"
            onClick={() => {
              hapticTap();
              justOpenedNotes.current = true;
              setNotesOpen(true);
            }}
            className="booking-add-note press-tap"
            data-testid="button-add-note"
          >
            <MessageSquarePlus className="h-4 w-4" strokeWidth={1.5} />
            {t("შენიშვნის დამატება", "Add a note")}
          </button>
        )}
      </div>

      <p className="booking-reassurance">
        <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span>{noPrepaymentLine(t)}</span>
      </p>
    </div>
  );
}

function ReviewRow({
  label,
  title,
  detail,
  editLabel,
  onEdit,
}: {
  label: string;
  title: string;
  detail: string;
  editLabel: string;
  onEdit: () => void;
}) {
  return (
    <div className="booking-review-row">
      <span className="min-w-0 flex-1">
        <span className="booking-review-label">{label}</span>
        <span className="block text-[14px] font-semibold text-[var(--theme-text)] leading-snug first-letter:uppercase">
          {title}
        </span>
        {detail && (
          <span className="block text-[12.5px] text-[var(--theme-muted1)] mt-0.5 leading-snug">{detail}</span>
        )}
      </span>
      <button
        type="button"
        onClick={() => {
          hapticTap();
          onEdit();
        }}
        className="booking-review-edit press-tap"
      >
        <PencilLine className="h-3.5 w-3.5" strokeWidth={1.8} />
        {editLabel}
      </button>
    </div>
  );
}

/* -------------- Bits -------------- */

/** Large soft-border field with a label that floats up on focus or once filled. */
function FloatingField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="float-field" data-invalid={!!error || undefined}>
        {children}
        <label htmlFor={id} className="float-label">
          {label}
        </label>
      </div>
      {error && (
        <p className="booking-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------- Confirmation: the invitation card -------------- */

function InvitationCard({
  data,
  onAddToCalendar,
  onBookAnother,
  onDone,
  studio,
  t,
  lang,
}: {
  data: SubmittedData;
  onAddToCalendar: () => void;
  onBookAnother: () => void;
  onDone: () => void;
  studio: Studio;
  t: T;
  lang: Lang;
}) {
  const aftercare = aftercareByCategory[data.category];
  const dateLocale = lang === "ka" ? ka : undefined;
  const [y, m, d] = data.dateISO.split("-").map(Number);
  const visitDate = new Date(y, (m || 1) - 1, d || 1);
  const promise = confirmationPromise;

  return (
    <div className="invitation" data-testid="booking-confirmation">
      <article className="invitation-card">
        <span className="invitation-line" aria-hidden />
        <Wordmark className="invitation-wordmark" />

        <p className="eyebrow invitation-status">{t("მოთხოვნა მიღებულია", "Request received")}</p>
        <h3 className="display invitation-title">
          {data.firstName
            ? t(`${data.firstName}, მალე გნახავთ`, `See you soon, ${data.firstName}`)
            : t("მალე გნახავთ", "See you soon")}
        </h3>

        <div className="invitation-when">
          <span className="invitation-date first-letter:uppercase">
            {format(visitDate, "EEEE, d MMMM", { locale: dateLocale })}
          </span>
          <span className="invitation-time">{data.time}</span>
        </div>

        <dl className="invitation-details">
          <div>
            <dt>{t("პროცედურა", "Treatment")}</dt>
            <dd>{[data.serviceLabel, data.treatmentsLabel].filter(Boolean).join(" · ")}</dd>
          </div>
          {data.staffName && (
            <div>
              <dt>{t("სპეციალისტი", "Specialist")}</dt>
              <dd>{data.staffName}</dd>
            </div>
          )}
          {data.confirmationCode && (
            <div>
              <dt>{t("ჯავშნის ნომერი", "Reference")}</dt>
              <dd className="tabular-nums tracking-[0.12em]">#{data.confirmationCode}</dd>
            </div>
          )}
          <div>
            <dt>{t("მისამართი", "Address")}</dt>
            <dd>
              {lang === "ka" ? studio.address.ka : studio.address.en}
              <a href={studio.mapUrl} target="_blank" rel="noopener noreferrer" className="invitation-map">
                {t("რუკაზე ნახვა", "Open map")}
              </a>
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onAddToCalendar}
          className="btn-quiet invitation-calendar"
          data-testid="button-add-to-calendar"
        >
          <CalendarPlus className="w-4 h-4" strokeWidth={1.5} />
          {t("კალენდარში დამატება", "Add to calendar")}
        </button>
      </article>

      <section className="invitation-expect" aria-labelledby="expect-title">
        <p id="expect-title" className="eyebrow">{t("შემდეგი ნაბიჯები", "What to expect")}</p>
        <ul>
          <li>
            {t(
              `ვიზიტის დადასტურებას ${promise ? `${promise.ka} ` : ""}ელ. ფოსტით მიიღებთ.`,
              `You'll get the confirmation by email${promise ? ` ${promise.en}` : ""}.`
            )}
          </li>
          <li>{t("გადახდა ვიზიტის შემდეგ.", "You pay after your visit.")}</li>
          <li>
            {t("ვიზიტის შეცვლა გსურთ? ", "Plans changed? ")}
            <a
              href={studio.whatsappLink(
                t(
                  `გამარჯობა! ჯავშანი #${data.confirmationCode} — მინდა შევცვალო.`,
                  `Hi, I'd like to change booking #${data.confirmationCode}.`
                )
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="link-line"
            >
              {t("მოგვწერეთ WhatsApp-ზე", "Message us on WhatsApp")}
            </a>
          </li>
        </ul>
      </section>

      {aftercare && (
        <section className="invitation-aftercare">
          <p className="eyebrow">{lang === "ka" ? aftercare.titleKa : aftercare.titleEn}</p>
          <p>{lang === "ka" ? aftercare.tipKa : aftercare.tipEn}</p>
        </section>
      )}

      <InstallPrompt />

      <div className="invitation-actions">
        <button type="button" onClick={onDone} className="pill-primary" data-testid="button-booking-done">
          {t("დახურვა", "Done")}
        </button>
        <button type="button" onClick={onBookAnother} className="link-line" data-testid="button-book-another">
          {t("ახალი ჯავშანი", "Book another visit")}
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

function buildIcs(data: SubmittedData, address: string): string {
  const [y, m, d] = data.dateISO.split("-").map(Number);
  const [hh, mm] = data.time.split(":").map(Number);
  const start = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // default 1h
  const uid = data.confirmationCode || `${data.dateISO}-${data.time}`;

  const summary = escapeIcsText(`THE MR Studio — ${data.serviceLabel}`);
  const description = escapeIcsText(
    [
      data.treatmentsLabel && `Treatment: ${data.treatmentsLabel}`,
      `Specialist: ${data.staffName}`,
      data.confirmationCode && `Reference: ${data.confirmationCode}`,
    ]
      .filter(Boolean)
      .join("\n")
  );
  const location = escapeIcsText(address);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//THE MR Studio//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}@mrstudio`,
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

function downloadIcs(data: SubmittedData, address: string) {
  if (!data.dateISO || !data.time) return;
  const ics = buildIcs(data, address);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mr-studio-${data.confirmationCode || data.dateISO}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
