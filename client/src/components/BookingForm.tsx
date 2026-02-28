import { useState, useMemo, useRef, useEffect } from "react";
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
import { format, isToday, isBefore, startOfToday, setHours, setMinutes } from "date-fns";
import { ka } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service, Staff } from "@shared/schema";

const timeSlots = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30"
];

const serviceCategories = [
  { value: "Manicure", label: "მანიკური" },
  { value: "Pedicure", label: "პედიკური" },
  { value: "Epilation", label: "ლაზერული ეპილაცია" },
  { value: "Cosmetology", label: "კოსმეტოლოგია" }
];

export default function BookingForm() {
  const [date, setDate] = useState<Date>();
  const savedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mr_booking_user') || '{}') : {};
  const [formData, setFormData] = useState({
    fullName: savedUser.fullName || "",
    email: savedUser.email || "",
    phone: savedUser.phone || "",
    serviceCategory: "",
    serviceDetails: "",
    staffId: "",
    time: "",
    notes: ""
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
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const bookedTimes = availabilityData?.bookedTimes || [];

  const availableTimes = useMemo(() => {
    let times = timeSlots.filter((time) => !bookedTimes.includes(time));

    // If selecting today, filter out past times and add lead time
    if (date && isToday(date)) {
      const now = new Date();
      // Add 1 hour lead time for same-day bookings to give staff time to prepare
      const minBookingTime = new Date(now.getTime() + 60 * 60 * 1000);

      times = times.filter((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        const slotTime = setMinutes(setHours(new Date(date), hours), minutes);
        return isBefore(minBookingTime, slotTime);
      });
    }

    return times;
  }, [bookedTimes, date]);

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return await apiRequest("POST", "/api/bookings", bookingData);
    },
    onSuccess: async () => {
      // First invalidate ALL availability queries (for any staffId/date combination)
      await queryClient.invalidateQueries({
        queryKey: ["/api/bookings/availability"],
      });
      // Also refetch any active availability queries to get fresh data
      await queryClient.refetchQueries({
        queryKey: ["/api/bookings/availability"],
      });

      toast({
        title: "მოთხოვნა გაგზავნილია!",
        description: "თქვენი დაჯავშნის მოთხოვნა გაიგზავნა. სპეციალისტი დაგიკავშირდებათ დასადასტურებლად",
      });

      // Save user details for next time
      localStorage.setItem('mr_booking_user', JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      }));

      // Reset form but keep personal details
      setFormData(prev => ({
        ...prev,
        serviceCategory: "",
        serviceDetails: "",
        staffId: "",
        time: "",
        notes: ""
      }));
      setDate(undefined);
    },
    onError: (error: any) => {
      console.error('Booking error:', error);
      const errorMessage = error?.message || "რაღაც არასწორად მოხდა. გთხოვთ სცადოთ ხელახლა";
      toast({
        title: "დაჯავშნა ვერ მოხერხდა",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

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
    const selectedCategory = serviceCategories.find(c => c.value === formData.serviceCategory);

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

  return (
    <section id="booking" className="dark section-spacing relative bg-[#0C0A09]" ref={sectionRef}>
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
      }} />

      <div className="editorial-max-width">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-white/50 tracking-kicker text-xs md:text-sm block mb-4 uppercase">კონციერჯი</span>
            <div className="mb-12">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 text-white font-normal">
                რეზერვაცია
              </h2>
              <p className="text-white/60 tracking-widest uppercase text-sm font-light">
                დაგეგმეთ თქვენი დრო
              </p>
            </div>
            <p className="text-base md:text-lg text-theme-muted max-w-lg mx-auto font-light leading-relaxed">
              აირჩიეთ სასურველი სერვისი და დრო. დაჯავშნის შემდეგ, ჩვენ მალევე დაგიკავშირდებით დასადასტურებლად.
            </p>
          </div>

          <div className={`glass-card p-8 md:p-12 rounded-none transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-2 group">
                  <Label htmlFor="fullName" className="text-sm font-medium tracking-wide text-white/70 group-focus-within:text-white transition-colors">სახელი და გვარი</Label>
                  <Input
                    id="fullName"
                    className="input-underline text-base h-12 px-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-white/10"
                    placeholder="შეიყვანეთ თქვენი სახელი და გვარი"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    data-testid="input-full-name"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-sm font-medium tracking-wide text-white/70 group-focus-within:text-white transition-colors">ელ. ფოსტა</Label>
                  <Input
                    id="email"
                    type="email"
                    className="input-underline text-base h-12 px-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-white/10"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-2 group">
                  <Label htmlFor="phone" className="text-sm font-medium tracking-wide text-white/70 group-focus-within:text-white transition-colors">ტელეფონის ნომერი</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="input-underline text-base h-12 px-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-white/10"
                    placeholder="+995 555 000 000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="serviceCategory" className="text-sm font-medium tracking-wide text-white/70 group-focus-within:text-white transition-colors">სერვისის კატეგორია</Label>
                  <Select
                    value={formData.serviceCategory}
                    onValueChange={(value) => setFormData({ ...formData, serviceCategory: value, staffId: "" })}
                  >
                    <SelectTrigger id="serviceCategory" className="input-underline text-base h-12 px-0 bg-transparent text-white border-b border-white/10 focus:ring-0 focus:ring-offset-0 rounded-none shadow-none">
                      <SelectValue placeholder="კატეგორიის არჩევა" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="serviceDetails" className="text-sm font-medium tracking-wide text-white/70 group-focus-within:text-white transition-colors">პროცედურის დეტალები</Label>
                <Textarea
                  id="serviceDetails"
                  placeholder="მიუთითეთ სასურველი პროცედურა..."
                  className="input-underline text-base min-h-[80px] px-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none resize-none border-b border-white/10"
                  value={formData.serviceDetails}
                  onChange={(e) => setFormData({ ...formData, serviceDetails: e.target.value })}
                  required
                  data-testid="textarea-service-details"
                />
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="staff" className="text-sm font-medium tracking-wide text-white/70 group-focus-within:text-white transition-colors">სპეციალისტი</Label>
                <Select
                  value={formData.staffId}
                  onValueChange={(value) => setFormData({ ...formData, staffId: value })}
                  disabled={!formData.serviceCategory || staffLoading}
                >
                  <SelectTrigger id="staff" className="input-underline text-base h-12 px-0 bg-transparent text-white border-b border-white/10 focus:ring-0 focus:ring-offset-0 rounded-none shadow-none disabled:opacity-50">
                    <SelectValue placeholder={
                      !formData.serviceCategory
                        ? "ჯერ აირჩიეთ კატეგორია"
                        : staffLoading
                          ? "იტვირთება..."
                          : availableStaff.length === 0
                            ? "სპეციალისტი არ მოიႾენება"
                            : "სპეციალისტის არჩევა"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-2 group">
                  <Label className="text-sm font-medium tracking-wide text-white/70 group-focus-within:text-white transition-colors">თარიღი</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-left font-normal text-base h-12 px-0 bg-transparent rounded-none border-b border-white/10 hover:bg-transparent hover:text-white ${!date && "text-white/40"
                          }`}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 opacity-50" />
                        {date ? format(date, "PPP", { locale: ka }) : "აირჩიეთ თარიღი"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-none bg-theme-surface/95 backdrop-blur-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        locale={ka}
                        disabled={(date) => isBefore(date, startOfToday())}
                        className="rounded-none border border-white/10"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="time" className="text-sm font-medium tracking-wide text-white/70 group-focus-within:text-white transition-colors">დრო</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => setFormData({ ...formData, time: value })}
                    disabled={!date || !formData.staffId}
                  >
                    <SelectTrigger id="time" className="input-underline text-base h-12 px-0 bg-transparent text-white border-b border-white/10 focus:ring-0 focus:ring-offset-0 rounded-none shadow-none disabled:opacity-50">
                      <SelectValue placeholder="დროის არჩევა" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.length === 0 && date ? (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          სრულად დაჯავშნული
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

              <div className="space-y-2 group">
                <Label htmlFor="notes" className="text-sm font-medium tracking-wide text-white/70 group-focus-within:text-white transition-colors">დამატებითი შენიშვნები</Label>
                <Textarea
                  id="notes"
                  placeholder="სპეციალური შენიშვნები/ სურვილები"
                  className="input-underline text-base min-h-[80px] px-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none resize-none border-b border-white/10"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 bg-theme-accent hover:bg-theme-accent-hover text-white font-medium tracking-widest uppercase text-sm magnetic-button mt-8"
                disabled={createBookingMutation.isPending}
                data-testid="button-book-appointment"
              >
                {createBookingMutation.isPending ? "გაგზავნა..." : "დადასტურეთ დაჯავშნა"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
