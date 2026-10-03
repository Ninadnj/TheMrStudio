import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertStudioInfoSchema, type SiteSettings, type StudioInfo } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { firstProblem, serverMessage } from "./adminUtils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type InfoForm = Omit<StudioInfo, "id">;
const FIELDS: { key: keyof InfoForm; label: string; hint?: string; type?: string; wide?: boolean }[] = [
  { key: "phone", label: "ტელეფონი", hint: "WhatsApp-ის ღილაკიც ამ ნომერზე მუშაობს", type: "tel" },
  { key: "email", label: "ელ. ფოსტა", type: "email" },
  { key: "addressKa", label: "მისამართი (ქართულად)", wide: true },
  { key: "addressEn", label: "მისამართი (ინგლისურად)", wide: true },
  { key: "mapQuery", label: "რუკის მისამართი", hint: "ამ ტექსტით იძებნება წერტილი Google Maps-ზე", wide: true },
  { key: "hoursKa", label: "სამუშაო საათები (ქართულად)", hint: "მაგ. „ორშ–შაბ · 10:00–20:00“. ცარიელი — საიტზე არ ჩანს" },
  { key: "hoursEn", label: "სამუშაო საათები (ინგლისურად)", hint: "მაგ. „Mon–Sat · 10:00–20:00“" },
  { key: "instagram", label: "Instagram-ის ბმული", hint: "ცარიელი — საიტზე არ ჩანს", type: "url" },
  { key: "facebook", label: "Facebook-ის ბმული", hint: "ცარიელი — საიტზე არ ჩანს", type: "url" },
];

export default function SiteSettingsEditor() {
  return (
    <div className="space-y-6 max-w-3xl">
      <StudioInfoCard />
      <BookingAlertsCard />
    </div>
  );
}

/** Contact details shown on the site: footer, booking window, confirmation and emails. */
function StudioInfoCard() {
  const { toast } = useToast();
  const { data: info } = useQuery<StudioInfo>({ queryKey: ["/api/studio-info"] });
  const [form, setForm] = useState<InfoForm | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (info) {
      const { id: _id, ...rest } = info;
      setForm(rest);
    }
  }, [info]);

  const save = useMutation({
    mutationFn: (data: InfoForm) => apiRequest("PUT", "/api/admin/studio-info", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studio-info"] });
      toast({ title: "შენახულია", description: "საიტზე ცვლილება უკვე ჩანს." });
    },
    onError: (error) => toast({ title: "ვერ შეინახა", description: serverMessage(error), variant: "destructive" }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>სტუდიის ინფორმაცია</CardTitle>
        <CardDescription>
          ჩანს საიტის ქვედა ნაწილში, დაჯავშნის ფანჯარაში, დადასტურებაზე და კლიენტის ელ. წერილებში.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!form ? (
          <p className="text-muted-foreground">იტვირთება…</p>
        ) : (
          <form
            noValidate
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              const issue = firstProblem(insertStudioInfoSchema, form);
              setProblem(issue);
              if (!issue) save.mutate(form);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {FIELDS.map(({ key, label, hint, type, wide }) => (
                <div key={key} className={`space-y-2 ${wide ? "sm:col-span-2" : ""}`}>
                  <Label htmlFor={`studio-${key}`}>{label}</Label>
                  <Input
                    id={`studio-${key}`}
                    type={type ?? "text"}
                    value={form[key] ?? ""}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    data-testid={`input-studio-${key}`}
                  />
                  {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                </div>
              ))}
            </div>
            {problem && (
              <p className="text-sm text-destructive" role="alert">
                {problem}
              </p>
            )}
            <Button type="submit" disabled={save.isPending} data-testid="button-save-studio">
              {save.isPending ? "ინახება…" : "შენახვა"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Where new-booking alerts are emailed. The older address/phone/hours columns in
 * site_settings aren't used by the site any more, so they're passed through untouched.
 */
function BookingAlertsCard() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<SiteSettings>({ queryKey: ["/api/admin/settings"] });
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    if (settings) setAdminEmail(settings.adminEmail || "");
  }, [settings]);

  const save = useMutation({
    mutationFn: () =>
      apiRequest("PUT", "/api/admin/settings", {
        address: settings?.address ?? "",
        phone: settings?.phone ?? "",
        email: settings?.email ?? "",
        hours: settings?.hours ?? "",
        adminEmail: adminEmail.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "შენახულია" });
    },
    onError: (error) => toast({ title: "ვერ შეინახა", description: serverMessage(error), variant: "destructive" }),
  });

  const invalid = adminEmail.trim() !== "" && !EMAIL.test(adminEmail.trim());

  return (
    <Card>
      <CardHeader>
        <CardTitle>შეტყობინება ახალ ჯავშანზე</CardTitle>
        <CardDescription>ყოველი ახალი ჯავშნის მოთხოვნა ამ მისამართზე მოგივათ ელ. ფოსტით.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!invalid) save.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="admin-email">ელ. ფოსტა</Label>
            <Input
              id="admin-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="studio@example.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              aria-invalid={invalid}
              disabled={isLoading}
              data-testid="input-admin-email"
            />
            {invalid && <p className="text-sm text-destructive">შეამოწმეთ ელ. ფოსტის მისამართი.</p>}
          </div>
          <Button type="submit" disabled={save.isPending || isLoading || invalid} data-testid="button-save-settings">
            {save.isPending ? "ინახება…" : "შენახვა"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
