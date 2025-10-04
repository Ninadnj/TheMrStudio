import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service, Staff } from "@shared/schema";

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
];

export default function BookingForm() {
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceId: "",
    staffId: "",
    time: "",
    notes: ""
  });
  const { toast } = useToast();

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const selectedService = useMemo(() => 
    services.find(s => s.id === formData.serviceId),
    [services, formData.serviceId]
  );

  const { data: availableStaff = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff/category", selectedService?.category],
    queryFn: async () => {
      if (!selectedService?.category) return [];
      const response = await fetch(`/api/staff/category/${selectedService.category}`);
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    },
    enabled: !!selectedService?.category,
  });

  const formattedDate = date ? format(date, "yyyy-MM-dd") : null;

  const { data: availabilityData } = useQuery<{ bookedTimes: string[] }>({
    queryKey: ["/api/bookings/availability", formattedDate],
    enabled: !!formattedDate,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const bookedTimes = availabilityData?.bookedTimes || [];
  const availableTimes = timeSlots.filter((time) => !bookedTimes.includes(time));

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const res = await apiRequest("/api/bookings", "POST", bookingData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/bookings/availability"],
        exact: false 
      });
      toast({
        title: "დაჯავშნის მოთხოვნა გაგზავნილია",
        description: "მალე დაგიკავშირდებით შეხვედრის დასადასტურებლად",
      });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        serviceId: "",
        staffId: "",
        time: "",
        notes: ""
      });
      setDate(undefined);
    },
    onError: () => {
      toast({
        title: "დაჯავშნა ვერ მოხერხდა",
        description: "რაღაც არასწორად მოხდა. გთხოვთ სცადოთ ხელახლა",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !formData.time) {
      toast({
        title: "არასრული ინფორმაცია",
        description: "გთხოვთ აირჩიოთ თარიღი და დრო",
        variant: "destructive",
      });
      return;
    }

    if (!formData.staffId) {
      toast({
        title: "არასრული ინფორმაცია",
        description: "გთხოვთ აირჩიოთ სპეციალისტი",
        variant: "destructive",
      });
      return;
    }

    const selectedStaff = availableStaff.find(s => s.id === formData.staffId);

    createBookingMutation.mutate({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      service: selectedService?.name || "",
      staffId: formData.staffId,
      staffName: selectedStaff?.name || "",
      date: formattedDate,
      time: formData.time,
      notes: formData.notes || null,
    });
  };

  return (
    <section id="booking" className="py-20 lg:py-32 bg-card">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 text-card-foreground font-normal">
            დაჯავშნეთ თქვენი ვიზიტი
          </h2>
          <p className="text-base text-muted-foreground tracking-wide">
            დაჯავშნეთ სასურველი პროცედურა და ჩვენ ყველაფერზე ვიზრუნებთ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">სრული სახელი *</Label>
              <Input
                id="fullName"
                placeholder="მაგ: ნინო გელაშვილი"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                data-testid="input-full-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">ელ. ფოსტა *</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                data-testid="input-email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">ტელეფონის ნომერი *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+995 555 123 456"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                data-testid="input-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">სერვისი *</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData({ ...formData, serviceId: value, staffId: "" })}
                disabled={servicesLoading}
                required
              >
                <SelectTrigger id="service" data-testid="select-service">
                  <SelectValue placeholder={servicesLoading ? "იტვირთება სერვისები..." : "აირჩიეთ სერვისი"} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff">აირჩიეთ სპეციალისტი *</Label>
            <Select
              value={formData.staffId}
              onValueChange={(value) => setFormData({ ...formData, staffId: value })}
              disabled={!selectedService || staffLoading}
              required
            >
              <SelectTrigger id="staff" data-testid="select-staff">
                <SelectValue placeholder={
                  !selectedService 
                    ? "ჯერ აირჩიეთ სერვისი" 
                    : staffLoading 
                    ? "იტვირთება სპეციალისტები..." 
                    : availableStaff.length === 0 
                    ? "სპეციალისტი არ მოიძებნა" 
                    : "აირჩიეთ სპეციალისტი"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableStaff.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>სასურველი თარიღი *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-date-picker"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "აირჩიეთ თარიღი"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">სასურველი დრო *</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => setFormData({ ...formData, time: value })}
                disabled={!date}
                required
              >
                <SelectTrigger id="time" data-testid="select-time">
                  <SelectValue placeholder={date ? "აირჩიეთ დრო" : "ჯერ აირჩიეთ თარიღი"} />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.length === 0 && date ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      ყველა დრო დაჯავშნილია ამ თარიღისთვის
                    </div>
                  ) : (
                    availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">დამატებითი შენიშვნები</Label>
            <Textarea
              id="notes"
              placeholder="სპეციალური სურვილები ან მოთხოვნები..."
              className="min-h-[120px] resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              data-testid="textarea-notes"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-theme-accent font-medium tracking-wide"
            disabled={createBookingMutation.isPending}
            data-testid="button-submit-booking"
          >
            {createBookingMutation.isPending ? "იგზავნება..." : "დაჯავშნის მოთხოვნა"}
          </Button>
        </form>
      </div>
    </section>
  );
}
