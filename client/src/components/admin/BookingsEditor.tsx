import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Edit, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Booking } from "@shared/schema";

export function BookingsEditor() {
  const { toast } = useToast();
  const [modifyBooking, setModifyBooking] = useState<Booking | null>(null);
  const [rejectBooking, setRejectBooking] = useState<Booking | null>(null);
  const [modifyTime, setModifyTime] = useState("");
  const [modifyDuration, setModifyDuration] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: pendingBookings = [], isLoading: loadingPending } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings/pending"],
  });

  const { data: confirmedBookings = [], isLoading: loadingConfirmed } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings/confirmed"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/admin/bookings/${id}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings/confirmed"] });
      toast({
        title: "Booking Approved",
        description: "The booking has been confirmed and added to Google Calendar.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve booking",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return await apiRequest("POST", `/api/admin/bookings/${id}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings/pending"] });
      toast({
        title: "Booking Rejected",
        description: "The booking request has been rejected.",
      });
      setRejectBooking(null);
      setRejectionReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject booking",
        variant: "destructive",
      });
    },
  });

  const modifyMutation = useMutation({
    mutationFn: async ({ id, time, duration }: { id: string; time?: string; duration?: string }) => {
      return await apiRequest("PUT", `/api/admin/bookings/${id}/modify`, { time, duration });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings/confirmed"] });
      toast({
        title: "Booking Modified",
        description: "The booking details have been updated.",
      });
      setModifyBooking(null);
      setModifyTime("");
      setModifyDuration("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to modify booking",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/bookings/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings/confirmed"] });
      toast({
        title: "Booking Deleted",
        description: "The booking and calendar event have been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      });
    },
  });

  const handleModify = (andApprove: boolean = false) => {
    if (!modifyBooking) return;
    modifyMutation.mutate({
      id: modifyBooking.id,
      time: modifyTime || undefined,
      duration: modifyDuration || undefined,
    }, {
      onSuccess: () => {
        if (andApprove) {
          // After modifying, approve the booking
          approveMutation.mutate(modifyBooking.id);
        }
      }
    });
  };

  const handleReject = () => {
    if (!rejectBooking) return;
    rejectMutation.mutate({
      id: rejectBooking.id,
      reason: rejectionReason || undefined,
    });
  };

  const BookingCard = ({ booking, isPending }: { booking: Booking; isPending: boolean }) => (
    <Card className="hover-elevate" data-testid={`booking-card-${booking.id}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{booking.fullName}</span>
          {isPending && (
            <span className="text-xs font-normal px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded">
              Pending
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {format(new Date(booking.date + 'T12:00:00'), 'PPPP')} at {booking.time}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Service</p>
          <p className="font-medium">{booking.service}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Staff</p>
            <p className="font-medium">{booking.staffName || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">{booking.duration} min</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{booking.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium text-xs">{booking.email}</p>
          </div>
        </div>
        {booking.notes && (
          <div>
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="text-sm">{booking.notes}</p>
          </div>
        )}
        {isPending ? (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => approveMutation.mutate(booking.id)}
              disabled={approveMutation.isPending}
              data-testid={`button-approve-${booking.id}`}
            >
              <Check className="w-4 h-4 mr-1" />
              Approve
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
              Modify
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRejectBooking(booking)}
              data-testid={`button-reject-${booking.id}`}
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => {
                if (confirm(`Are you sure you want to delete this booking for ${booking.fullName}? This will also remove the event from Google Calendar.`)) {
                  deleteMutation.mutate(booking.id);
                }
              }}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${booking.id}`}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-light mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Pending Bookings
        </h2>
        {loadingPending ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : pendingBookings.length === 0 ? (
          <p className="text-muted-foreground">No pending booking requests</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isPending={true} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-light mb-6 flex items-center gap-2">
          <Check className="w-6 h-6" />
          Confirmed Bookings
        </h2>
        {loadingConfirmed ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : confirmedBookings.length === 0 ? (
          <p className="text-muted-foreground">No confirmed bookings</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {confirmedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isPending={false} />
            ))}
          </div>
        )}
      </div>

      {/* Modify Dialog */}
      <Dialog open={!!modifyBooking} onOpenChange={() => setModifyBooking(null)}>
        <DialogContent data-testid="dialog-modify-booking">
          <DialogHeader>
            <DialogTitle>Modify Booking</DialogTitle>
            <DialogDescription>
              Update the booking time and/or duration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="modify-time">Time</Label>
              <Select value={modifyTime} onValueChange={setModifyTime}>
                <SelectTrigger id="modify-time" data-testid="select-modify-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
                    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", 
                    "18:00", "18:30"].map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="modify-duration">Duration (minutes)</Label>
              <Select value={modifyDuration} onValueChange={setModifyDuration}>
                <SelectTrigger id="modify-duration" data-testid="select-modify-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="150">2.5 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                  <SelectItem value="210">3.5 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModifyBooking(null)}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleModify(false)} 
              disabled={modifyMutation.isPending || approveMutation.isPending} 
              data-testid="button-confirm-modify"
            >
              Save Changes Only
            </Button>
            <Button 
              onClick={() => handleModify(true)} 
              disabled={modifyMutation.isPending || approveMutation.isPending} 
              data-testid="button-modify-approve"
            >
              <Check className="w-4 h-4 mr-1" />
              Save & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectBooking} onOpenChange={() => setRejectBooking(null)}>
        <DialogContent data-testid="dialog-reject-booking">
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Optionally provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="rejection-reason">Reason (optional)</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Fully booked on this date"
              className="min-h-[100px]"
              data-testid="textarea-rejection-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectBooking(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
