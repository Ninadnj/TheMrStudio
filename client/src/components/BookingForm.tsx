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
  "08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"
];

const serviceCategories = [
  { value: "Nail", label: "მანიკური / პედიკური" },
  { value: "Epilation", label: "ლაზერული ეპილაცია" },
  { value: "Cosmetology", label: "კოსმეტოლოგია" }
];

export default function BookingForm() {
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceCategory: "",
    serviceDetails: "",
    staffId: "",
    time: "",
    notes: ""
  });
  const { toast } = useToast();

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
        serviceCategory: "",
        serviceDetails: "",
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
                placeholder="მაგ: მარიამ ესებუა"
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
              <Label htmlFor="serviceCategory">სერვისის კატეგორია *</Label>
              <Select
                value={formData.serviceCategory}
                onValueChange={(value) => setFormData({ ...formData, serviceCategory: value, staffId: "" })}
                required
              >
                <SelectTrigger id="serviceCategory" data-testid="select-service-category">
                  <SelectValue placeholder="აირჩიეთ კატეგორია" />
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

          <div className="space-y-2">
            <Label htmlFor="serviceDetails">რა პროცედურა გსურთ? *</Label>
            <Textarea
              id="serviceDetails"
              placeholder="მაგ: გელ ლაქი ფრჩხილების აწევით, თეთრი ფერი"
              className="min-h-[100px] resize-none"
              value={formData.serviceDetails}
              onChange={(e) => setFormData({ ...formData, serviceDetails: e.target.value })}
              required
              data-testid="textarea-service-details"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff">აირჩიეთ სპეციალისტი *</Label>
            <Select
              value={formData.staffId}
              onValueChange={(value) => setFormData({ ...formData, staffId: value })}
              disabled={!formData.serviceCategory || staffLoading}
              required
            >
              <SelectTrigger id="staff" data-testid="select-staff">
                <SelectValue placeholder={
                  !formData.serviceCategory 
                    ? "ჯერ აირჩიეთ კატეგორია" 
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
              placeholder="პერსონალური შენიშვნა"
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
