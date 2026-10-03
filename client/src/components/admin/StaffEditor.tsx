import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertStaffSchema, type Staff } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, UserPlus } from "lucide-react";

const staffFormSchema = insertStaffSchema.extend({
  name: z.string().trim().min(2, "ჩაწერეთ სახელი (მინიმუმ 2 ასო)"),
  serviceCategory: z.string().min(1, "აირჩიეთ სერვისი"),
  order: z.string().min(1, "მიუთითეთ რიგითობა"),
});

type StaffFormData = z.infer<typeof staffFormSchema>;

export function StaffEditor() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: staff = [], isLoading } = useQuery<Staff[]>({
    queryKey: ["/api/admin/staff"],
  });

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      serviceCategory: "",
      calendarId: "",
      order: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      return await apiRequest("POST", "/api/admin/staff", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      form.reset();
      setEditingId(null);
      toast({
        title: "სპეციალისტი დაემატა",
      });
    },
    onError: (error: any) => {
      console.error("Staff creation error:", error);
      toast({
        title: "შეცდომა",
        description: "ვერ დაემატა. სცადეთ ხელახლა.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StaffFormData> }) => {
      return await apiRequest("PUT", `/api/admin/staff/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      form.reset();
      setEditingId(null);
      toast({
        title: "ცვლილება შენახულია",
      });
    },
    onError: (error: any) => {
      console.error("Staff update error:", error);
      toast({
        title: "შეცდომა",
        description: "ვერ შეინახა. სცადეთ ხელახლა.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      toast({
        title: "სპეციალისტი წაიშალა",
      });
    },
    onError: () => {
      toast({
        title: "შეცდომა",
        description: "ვერ წაიშალა. სცადეთ ხელახლა.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StaffFormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingId(staffMember.id);
    form.reset({
      name: staffMember.name,
      serviceCategory: staffMember.serviceCategory,
      calendarId: staffMember.calendarId || "",
      order: staffMember.order,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({
      name: "",
      serviceCategory: "",
      calendarId: "",
      order: "",
    });
  };

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">იტვირთება…</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {editingId ? "სპეციალისტის რედაქტირება" : "ახალი სპეციალისტი"}
          </CardTitle>
          <CardDescription>
            ვინ რა სერვისს ასრულებს — სპეციალისტები დაჯავშნის ფანჯარაში ამ სიიდან ჩანს.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>სახელი</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="მაგ. მარიამი"
                        {...field}
                        data-testid="input-staff-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>სერვისი</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-service-category">
                          <SelectValue placeholder="აირჩიეთ სერვისი" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Manicure">მანიკური</SelectItem>
                        <SelectItem value="Pedicure">პედიკური</SelectItem>
                        <SelectItem value="Epilation">ლაზერული ეპილაცია</SelectItem>
                        <SelectItem value="Cosmetology">კოსმეტოლოგია</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="calendarId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Calendar-ის ID</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      დადასტურებული ვიზიტები ამ კალენდარში ემატება, ხოლო მასში დაკავებულ დროს საიტზე ვერ დაჯავშნიან.
                    </p>
                    <FormControl>
                      <Input
                        placeholder="name@gmail.com ან …@group.calendar.google.com"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-calendar-id"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>რიგითობა</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1, 2, 3..."
                        {...field}
                        data-testid="input-order"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-staff"
                >
                  {editingId ? "შენახვა" : "დამატება"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    data-testid="button-cancel-edit"
                  >
                    გაუქმება
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>სპეციალისტები</CardTitle>
          <CardDescription>
            {staff.length} staff member{staff.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <p className="text-muted-foreground text-sm">სპეციალისტი ჯერ არ არის დამატებული</p>
          ) : (
            <div className="space-y-2">
              {staff.map((member) => (
                <Card key={member.id} data-testid={`staff-card-${member.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {member.serviceCategory === "Nail" ? "მანიკური / პედიკური" :
                            member.serviceCategory === "Manicure" ? "მანიკური" :
                              member.serviceCategory === "Pedicure" ? "პედიკური" :
                                member.serviceCategory === "Epilation" ? "ლაზერული ეპილაცია" :
                                  member.serviceCategory === "Cosmetology" ? "კოსმეტოლოგია" :
                                    member.serviceCategory}
                        </p>
                        {member.serviceCategory === "Nail" && (
                          <p className="text-xs text-destructive mt-1">
                            საიტზე ვერ დაჯავშნიან: დააჭირეთ რედაქტირებას და აირჩიეთ მანიკური ან პედიკური.
                          </p>
                        )}
                        {member.calendarId ? (
                          <p className="text-xs text-muted-foreground mt-1 break-all">
                            კალენდარი: {member.calendarId}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">
                            კალენდარი არ არის მითითებული — ვიზიტები Google Calendar-ში არ დაემატება.
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(member)}
                          data-testid={`button-edit-staff-${member.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`წაიშალოს სპეციალისტი „${member.name}“?`)) {
                              deleteMutation.mutate(member.id);
                            }
                          }}
                          data-testid={`button-delete-staff-${member.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
