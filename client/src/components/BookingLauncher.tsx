import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BOOKING_REQUEST_EVENT, type BookingRequest } from "@/lib/serviceMenu";

const loadSheet = () => import("@/components/BookingForm");
const BookingSheet = lazy(loadSheet);

/**
 * Keeps the booking sheet (drawer, calendar, date library) out of the first
 * load. It is fetched quietly once the page is idle, or immediately on the
 * first "Book" tap — that tap is handed to the sheet so nothing is lost.
 */
export default function BookingLauncher() {
  const [mounted, setMounted] = useState(false);
  const firstRequest = useRef<BookingRequest | undefined>(undefined);

  useEffect(() => {
    const onRequest = (event: Event) => {
      firstRequest.current = (event as CustomEvent<BookingRequest | undefined>).detail;
      setMounted(true);
      window.removeEventListener(BOOKING_REQUEST_EVENT, onRequest);
    };
    window.addEventListener(BOOKING_REQUEST_EVENT, onRequest);

    // Warm the chunk once the page has settled, so the first tap feels instant.
    const warm = () => void loadSheet();
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleId = w.requestIdleCallback ? w.requestIdleCallback(warm, { timeout: 4000 }) : undefined;
    const timerId = idleId === undefined ? window.setTimeout(warm, 2500) : undefined;

    return () => {
      window.removeEventListener(BOOKING_REQUEST_EVENT, onRequest);
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <BookingSheet openOnMount initialRequest={firstRequest.current} />
    </Suspense>
  );
}
