import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Edit, Clock, Trash2, Phone, MessageCircle, Mail, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ka } from "date-fns/locale";
import type { Booking } from "@shared/schema";
import { bookingRef } from "@/lib/serviceMenu";

/** New requests show up on their own: the list refreshes this often (and when the tab regains focus). */
export const BOOKINGS_REFRESH_MS = 30_000;

const TIME_OPTIONS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30",
];

const DURATION_OPTIONS = [
  ["30", "30 წუთი"], ["60", "1 საათი"], ["90", "1,5 საათი"], ["120", "2 საათი"],
  ["150", "2,5 საათი"], ["180", "3 საათი"], ["210", "3,5 საათი"], ["240", "4 საათი"],
];

const byDateTime = (a: Booking, b: Booking) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);

/** Georgian mobiles are typed as "555 12 34 56"; WhatsApp needs the country code. */
function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 9 ? `995${digits}` : digits;
}

function visitDate(booking: Booking) {
  return format(new Date(`${booking.date}T12:00:00`), "EEEE, d MMMM", { locale: ka });
}

export function BookingsEditor() {
  const { toast } = useToast();
  const [modifyBooking, setModifyBooking] = useState<Booking | null>(null);
  const [rejectBooking, setRejectBooking] = useState<Booking | null>(null);
  const [modifyTime, setModifyTime] = useState("");
  const [modifyDuration, setModifyDuration] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showPast, setShowPast] = useState(false);

  const live = { refetchInterval: BOOKINGS_REFRESH_MS, refetchOnWindowFocus: true } as const;
  const pendingQuery = useQuery<Booking[]>({ queryKey: ["/api/admin/bookings/pending"], ...live });
  const confirmedQuery = useQuery<Booking[]>({ queryKey: ["/api/admin/bookings/confirmed"], ...live });

  const today = format(new Date(), "yyyy-MM-dd");
  const pending = useMemo(() => [...(pendingQuery.data ?? [])].sort(byDateTime), [pendingQuery.data]);
  const { upcoming, past } = useMemo(() => {
    const all = [...(confirmedQuery.data ?? [])].sort(byDateTime);
    return {
      upcoming: all.filter((b) => b.date >= today),
      past: all.filter((b) => b.date < today).reverse(),
    };
  }, [confirmedQuery.data, today]);

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings/pending"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings/confirmed"] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/bookings/${id}/approve`, {}),
    onSuccess: (booking: Booking) => {
      refreshAll();
      toast(
        booking?.calendarEventId
          ? { title: "ჯავშანი დადასტურდა", description: "დაემატა სპეციალისტის Google Calendar-ში." }
          : {
              title: "ჯავშანი დადასტურდა",
              description: "Google Calendar-ში ვერ დაემატა — შეამოწმეთ სპეციალისტის კალენდრის ID „სპეციალისტების“ გვერდზე.",
            }
      );
    },
    onError: () => toast({ title: "ვერ დადასტურდა", description: "არაფერი შეცვლილა. სცადეთ ხელახლა.", variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiRequest("POST", `/api/admin/bookings/${id}/reject`, { reason }),
    onSuccess: () => {
      refreshAll();
      toast({ title: "მოთხოვნა უარყოფილია" });
      setRejectBooking(null);
      setRejectionReason("");
    },
    onError: () => toast({ title: "უარყოფა ვერ მოხერხდა", description: "არაფერი შეცვლილა. სცადეთ ხელახლა.", variant: "destructive" }),
  });

  const modifyMutation = useMutation({
    mutationFn: ({ id, time, duration }: { id: string; time?: string; duration?: string }) =>
      apiRequest("PUT", `/api/admin/bookings/${id}/modify`, { time, duration }),
    onSuccess: () => {
      refreshAll();
      toast({ title: "ჯავშანი განახლდა" });
      setModifyBooking(null);
    },
    onError: () => toast({ title: "ცვლილება ვერ შეინახა", description: "სცადეთ ხელახლა.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/bookings/${id}`, {}),
    onSuccess: () => {
      refreshAll();
      toast({ title: "ჯავშანი წაიშალა", description: "Google Calendar-იდანაც წაიშალა." });
    },
    onError: () => toast({ title: "წაშლა ვერ მოხერხდა", description: "სცადეთ ხელახლა.", variant: "destructive" }),
  });

  const handleModify = (andApprove: boolean) => {
    if (!modifyBooking) return;
    const id = modifyBooking.id;
    modifyMutation.mutate(
      { id, time: modifyTime || undefined, duration: modifyDuration || undefined },
      { onSuccess: () => andApprove && approveMutation.mutate(id) }
    );
  };

  const BookingCard = ({ booking, isPending }: { booking: Booking; isPending: boolean }) => {
    const busy =
      (approveMutation.isPending && approveMutation.variables === booking.id) ||
      (deleteMutation.isPending && deleteMutation.variables === booking.id);
    return (
      <Card data-testid={`booking-card-${booking.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-lg font-medium break-words">{booking.fullName}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{visitDate(booking)}</span>
                {" · "}
                <span className="font-medium text-foreground tabular-nums">{booking.time}</span>
                <span className="ml-2 font-mono text-xs tracking-wider">#{bookingRef(booking.id)}</span>
              </p>
            </div>
            {isPending && (
              <span className="shrink-0 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-300">
                ელოდება
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="col-span-2">
              <dt className="text-muted-foreground">პროცედურა</dt>
              <dd className="font-medium">{booking.service}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">სპეციალისტი</dt>
              <dd className="font-medium">{booking.staffName || "ნებისმიერი"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">ხანგრძლივობა</dt>
              <dd className="font-medium">{booking.duration} წთ</dd>
            </div>
            {booking.notes && (
              <div className="col-span-2">
                <dt className="text-muted-foreground">კლიენტის შენიშვნა</dt>
                <dd className="whitespace-pre-wrap">{booking.notes}</dd>
              </div>
            )}
          </dl>

          {/* One tap to reach the client (confirmation itself goes out by email on Confirm) */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${booking.phone.replace(/\s/g, "")}`} data-testid={`link-call-${booking.id}`}>
                <Phone className="w-4 h-4 mr-1.5" />
                {booking.phone}
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://wa.me/${whatsappNumber(booking.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`link-whatsapp-${booking.id}`}
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                WhatsApp
              </a>
            </Button>
            {booking.email && (
              <Button size="sm" variant="outline" asChild>
                <a href={`mailto:${booking.email}`} title={booking.email} data-testid={`link-email-${booking.id}`}>
                  <Mail className="w-4 h-4 mr-1.5" />
                  ელ. ფოსტა
                </a>
              </Button>
            )}
          </div>

          {isPending ? (
            <div className="grid grid-cols-3 gap-2 border-t pt-4">
              <Button
                size="sm"
                onClick={() => approveMutation.mutate(booking.id)}
                disabled={busy}
                data-testid={`button-approve-${booking.id}`}
              >
                <Check className="w-4 h-4 mr-1" />
                {busy ? "…" : "დადასტურება"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setModifyBooking(booking);
                  setModifyTime(booking.time);
                  setModifyDuration(String(booking.duration));
                }}
                data-testid={`button-modify-${booking.id}`}
              >
                <Edit className="w-4 h-4 mr-1" />
                შეცვლა
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setRejectBooking(booking)}
                data-testid={`button-reject-${booking.id}`}
              >
                <X className="w-4 h-4 mr-1" />
                უარყოფა
              </Button>
            </div>
          ) : (
            <div className="flex justify-end border-t pt-4">
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm(`წაიშალოს ჯავშანი — ${booking.fullName}, ${visitDate(booking)}? Google Calendar-იდანაც წაიშლება.`)) {
                    deleteMutation.mutate(booking.id);
                  }
                }}
                disabled={busy}
                data-testid={`button-delete-${booking.id}`}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                წაშლა
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const Section = ({
    title,
    icon,
    loading,
    items,
    empty,
    isPending,
  }: {
    title: string;
    icon: React.ReactNode;
    loading: boolean;
    items: Booking[];
    empty: string;
    isPending: boolean;
  }) => (
    <section>
      <h2 className="text-xl sm:text-2xl font-light mb-4 flex items-center gap-2">
        {icon}
        {title}
        {items.length > 0 && <span className="text-muted-foreground tabular-nums">({items.length})</span>}
      </h2>
      {loading ? (
        <p className="text-muted-foreground">იტვირთება…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">{empty}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((booking) => (
            <BookingCard key={booking.id} booking={booking} isPending={isPending} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>ახალი მოთხოვნები აქ თავისით ჩნდება.</p>
        <Button size="sm" variant="ghost" onClick={refreshAll} data-testid="button-refresh-bookings">
          <RefreshCw className={`w-4 h-4 mr-1.5 ${pendingQuery.isFetching ? "animate-spin" : ""}`} />
          განახლება
        </Button>
      </div>

      <Section
        title="დასადასტურებელი"
        icon={<Clock className="w-5 h-5" />}
        loading={pendingQuery.isLoading}
        items={pending}
        empty="ახალი მოთხოვნა არ არის."
        isPending
      />

      <Section
        title="მომავალი ვიზიტები"
        icon={<Check className="w-5 h-5" />}
        loading={confirmedQuery.isLoading}
        items={upcoming}
        empty="დადასტურებული ვიზიტი ჯერ არ არის."
        isPending={false}
      />

      {past.length > 0 && (
        <div>
          <Button variant="outline" size="sm" onClick={() => setShowPast((v) => !v)} data-testid="button-toggle-past">
            {showPast ? "წარსული ვიზიტების დამალვა" : `წარსული ვიზიტები (${past.length})`}
          </Button>
          {showPast && (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {past.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPending={false} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Change time / duration */}
      <Dialog open={!!modifyBooking} onOpenChange={(open) => !open && setModifyBooking(null)}>
        <DialogContent data-testid="dialog-modify-booking">
          <DialogHeader>
            <DialogTitle>ჯავშნის შეცვლა</DialogTitle>
            <DialogDescription>
              {modifyBooking && `${modifyBooking.fullName} · ${visitDate(modifyBooking)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modify-time">დრო</Label>
              <Select value={modifyTime} onValueChange={setModifyTime}>
                <SelectTrigger id="modify-time" data-testid="select-modify-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="modify-duration">ხანგრძლივობა</Label>
              <Select value={modifyDuration} onValueChange={setModifyDuration}>
                <SelectTrigger id="modify-duration" data-testid="select-modify-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setModifyBooking(null)}>
              გაუქმება
            </Button>
            <Button
              variant="outline"
              onClick={() => handleModify(false)}
              disabled={modifyMutation.isPending || approveMutation.isPending}
              data-testid="button-confirm-modify"
            >
              მხოლოდ შენახვა
            </Button>
            <Button
              onClick={() => handleModify(true)}
              disabled={modifyMutation.isPending || approveMutation.isPending}
              data-testid="button-modify-approve"
            >
              <Check className="w-4 h-4 mr-1" />
              შენახვა და დადასტურება
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline */}
      <Dialog open={!!rejectBooking} onOpenChange={(open) => !open && setRejectBooking(null)}>
        <DialogContent data-testid="dialog-reject-booking">
          <DialogHeader>
            <DialogTitle>უარვყოთ მოთხოვნა?</DialogTitle>
            <DialogDescription>
              მიუთითეთ მოკლე მიზეზი (არასავალდებულო) — ის კლიენტს ელ. წერილში მიუვა.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">მიზეზი</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="მაგ. ეს დღე უკვე დაკავებულია — გთხოვთ, აირჩიოთ სხვა დრო"
              className="min-h-[100px]"
              data-testid="textarea-rejection-reason"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setRejectBooking(null)}>
              გაუქმება
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectBooking && rejectMutation.mutate({ id: rejectBooking.id, reason: rejectionReason || undefined })}
              disabled={rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              უარყოფა
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
