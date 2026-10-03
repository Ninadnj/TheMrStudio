import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSpecialOfferSchema, type SpecialOffer } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Trash2, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function SpecialOffersEditor() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: offers = [] } = useQuery<SpecialOffer[]>({
    queryKey: ["/api/admin/special-offers"],
  });

  const form = useForm({
    resolver: zodResolver(insertSpecialOfferSchema),
    defaultValues: {
      message: "",
      isActive: false,
      expiryDate: "",
      link: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/special-offers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/special-offers"] });
      toast({
        title: "აქცია დაემატა",
      });
      form.reset();
      setShowForm(false);
    },
    onError: () => {
      toast({
        title: "შეცდომა",
        description: "აქცია ვერ დაემატა. სცადეთ ხელახლა.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/admin/special-offers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/special-offers"] });
      toast({
        title: "აქცია განახლდა",
      });
    },
    onError: () => {
      toast({
        title: "შეცდომა",
        description: "ვერ შეინახა. სცადეთ ხელახლა.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/special-offers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/special-offers"] });
      toast({
        title: "აქცია წაიშალა",
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

  const handleToggleActive = (offer: SpecialOffer) => {
    updateMutation.mutate({
      id: offer.id,
      data: { ...offer, isActive: !offer.isActive },
    });
  };

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      expiryDate: data.expiryDate || null,
      link: data.link || null,
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>აქციები</CardTitle>
              <CardDescription>ჩართული აქცია საიტის თავში ზოლად ჩანს. ერთ დროს ერთი აქცია ჩანს.</CardDescription>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              variant="outline"
              data-testid="button-toggle-offer-form"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? "გაუქმება" : "ახალი აქცია"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ტექსტი</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="მაგ. ლაზერული ეპილაცია −20% ამ კვირაში"
                              data-testid="input-offer-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ბმული (არასავალდებულო)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="მაგ. #prices — ან დატოვეთ ცარიელი"
                              data-testid="input-offer-link"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ბოლო დღე (არასავალდებულო)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              data-testid="input-offer-expiry"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormLabel>ჩართულია</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-offer-active"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="bg-theme-accent"
                      disabled={createMutation.isPending}
                      data-testid="button-create-offer"
                    >
                      {createMutation.isPending ? "ინახება…" : "დამატება"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {offers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              აქცია ჯერ არ გაქვთ. დაამატეთ — და საიტის თავში ზოლად გამოჩნდება.
            </p>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => {
                // Runs through the whole expiry day, Tbilisi time — matches the server
                const isExpired = !!offer.expiryDate && new Date(`${offer.expiryDate}T23:59:59+04:00`) < new Date();
                return (
                <Card key={offer.id} className={`border-2 ${isExpired ? 'border-destructive/50 bg-destructive/5' : ''}`} data-testid={`offer-card-${offer.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-medium">{offer.message}</p>
                          {isExpired && (
                            <span className="text-xs px-2 py-0.5 rounded-none bg-destructive/20 text-destructive font-medium">
                              ვადა გავიდა
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {offer.expiryDate && (
                            <span className={isExpired ? 'text-destructive font-medium' : ''}>
                              ბოლო დღე: {offer.expiryDate.split("-").reverse().join(".")}
                            </span>
                          )}
                          {offer.link && <span>ბმული: {offer.link}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {offer.isActive ? "ჩართულია" : "გამორთულია"}
                          </span>
                          <Switch
                            checked={offer.isActive}
                            onCheckedChange={() => handleToggleActive(offer)}
                            data-testid={`switch-toggle-${offer.id}`}
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => confirm("წაიშალოს ეს აქცია?") && deleteMutation.mutate(offer.id)}
                          aria-label="წაშლა"
                          data-testid={`button-delete-${offer.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
