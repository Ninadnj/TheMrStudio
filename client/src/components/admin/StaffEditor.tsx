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
  name: z.string().min(2, "Name must be at least 2 characters"),
  serviceCategory: z.string().min(1, "Service category is required"),
  order: z.string().min(1, "Order is required"),
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
        title: "Success",
        description: "Staff member added successfully",
      });
    },
    onError: (error: any) => {
      console.error("Staff creation error:", error);
      toast({
        title: "შეცდომა",
        description: error?.message || "Failed to add staff member",
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
        title: "Success",
        description: "Staff member updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Staff update error:", error);
      toast({
        title: "შეცდომა",
        description: error?.message || "Failed to update staff member",
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
        title: "Success",
        description: "Staff member deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete staff member",
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
    return <div className="p-6 text-muted-foreground">Loading staff...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {editingId ? "Edit Staff Member" : "Add New Staff Member"}
          </CardTitle>
          <CardDescription>
            Manage staff members and their service specializations
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Mari, User 1"
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
                    <FormLabel>Service Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-service-category">
                          <SelectValue placeholder="Select service category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nail">მანიკური / პედიკური</SelectItem>
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
                    <FormLabel>Google Calendar ID (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="For future Google Calendar integration"
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
                    <FormLabel>Display Order</FormLabel>
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
                  {editingId ? "Update Staff Member" : "Add Staff Member"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Staff Members</CardTitle>
          <CardDescription>
            {staff.length} staff member{staff.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <p className="text-muted-foreground text-sm">No staff members yet</p>
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
                           member.serviceCategory === "Epilation" ? "ლაზერული ეპილაცია" :
                           member.serviceCategory === "Cosmetology" ? "კოსმეტოლოგია" :
                           member.serviceCategory}
                        </p>
                        {member.calendarId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Calendar: {member.calendarId}
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
                            if (confirm(`Delete ${member.name}?`)) {
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
