import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  insertPriceGroupSchema,
  insertPriceItemSchema,
  type PriceItem,
  type PriceMenuGroup,
} from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { bookingCategories } from "@/lib/serviceMenu";
import { firstProblem, moved, serverMessage } from "./adminUtils";

const MENU_KEY = ["/api/price-menu"];
const serviceLabel = (value: string) => bookingCategories.find((c) => c.value === value)?.labelKa ?? value;

type GroupForm = { id?: string; titleKa: string; titleEn: string; shortKa: string; shortEn: string };
type ItemForm = {
  id?: string;
  groupId: string;
  nameKa: string;
  nameEn: string;
  price: string;
  durationMin: string;
  booking: string;
};

const emptyGroup: GroupForm = { titleKa: "", titleEn: "", shortKa: "", shortEn: "" };

/** The price list on the site, edited here: groups of treatments with prices. */
export default function PricesEditor() {
  const { toast } = useToast();
  const { data: menu = [], isLoading } = useQuery<PriceMenuGroup[]>({ queryKey: MENU_KEY });
  const [group, setGroup] = useState<GroupForm | null>(null);
  const [item, setItem] = useState<ItemForm | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: MENU_KEY });
  const failed = (error: unknown) => toast({ title: "ვერ შეინახა", description: serverMessage(error), variant: "destructive" });

  const saveGroup = useMutation({
    mutationFn: ({ id, ...data }: GroupForm) =>
      id ? apiRequest("PUT", `/api/admin/price-groups/${id}`, data) : apiRequest("POST", "/api/admin/price-groups", data),
    onSuccess: (_d, vars) => {
      refresh();
      setGroup(null);
      toast({ title: vars.id ? "ჯგუფი განახლდა" : "ჯგუფი დაემატა" });
    },
    onError: failed,
  });

  const deleteGroup = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/price-groups/${id}`),
    onSuccess: () => {
      refresh();
      toast({ title: "ჯგუფი წაიშალა" });
    },
    onError: failed,
  });

  const saveItem = useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown> & { id?: string }) =>
      id ? apiRequest("PUT", `/api/admin/price-items/${id}`, data) : apiRequest("POST", "/api/admin/price-items", data),
    onSuccess: (_d, vars) => {
      refresh();
      setItem(null);
      toast({ title: vars.id ? "პროცედურა განახლდა" : "პროცედურა დაემატა" });
    },
    onError: failed,
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/price-items/${id}`),
    onSuccess: () => {
      refresh();
      toast({ title: "პროცედურა წაიშალა" });
    },
    onError: failed,
  });

  const reorder = useMutation({
    mutationFn: ({ kind, ids }: { kind: "groups" | "items"; ids: string[] }) =>
      apiRequest("PUT", `/api/admin/price-${kind}/order`, { ids }),
    onSuccess: refresh,
    onError: failed,
  });

  const submitGroup = () => {
    if (!group) return;
    const data = {
      titleKa: group.titleKa.trim(),
      titleEn: group.titleEn.trim(),
      shortKa: group.shortKa.trim(),
      shortEn: group.shortEn.trim(),
    };
    const issue = firstProblem(insertPriceGroupSchema, data);
    setProblem(issue);
    if (!issue) saveGroup.mutate({ id: group.id, ...data });
  };

  const submitItem = () => {
    if (!item) return;
    const data = {
      groupId: item.groupId,
      nameKa: item.nameKa.trim(),
      nameEn: item.nameEn.trim(),
      price: item.price.trim() === "" ? NaN : Number(item.price),
      durationMin: item.durationMin.trim() === "" ? null : Number(item.durationMin),
      booking: item.booking,
    };
    if (Number.isNaN(data.price)) return setProblem("ჩაწერეთ ფასი (მხოლოდ რიცხვი)");
    if (data.durationMin !== null && (Number.isNaN(data.durationMin) || data.durationMin <= 0)) {
      return setProblem("ხანგრძლივობა — წუთების რაოდენობა, მაგ. 60. ან დატოვეთ ცარიელი.");
    }
    const issue = firstProblem(insertPriceItemSchema, data);
    setProblem(issue);
    if (!issue) saveItem.mutate({ id: item.id, ...data });
  };

  const openItem = (groupOf: PriceMenuGroup, existing?: PriceItem) => {
    setProblem(null);
    setItem(
      existing
        ? {
            id: existing.id,
            groupId: existing.groupId,
            nameKa: existing.nameKa,
            nameEn: existing.nameEn,
            price: String(existing.price),
            durationMin: existing.durationMin ? String(existing.durationMin) : "",
            booking: existing.booking,
          }
        : {
            groupId: groupOf.id,
            nameKa: "",
            nameEn: "",
            price: "",
            durationMin: "",
            // New treatments usually belong to the same service as their neighbours
            booking: groupOf.items[0]?.booking ?? "",
          }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle>ფასები და პროცედურები</CardTitle>
            <CardDescription>
              ეს არის საიტის ფასების სია. ცვლილება საიტზე მაშინვე გამოჩნდება — ფასების სიაშიც და დაჯავშნის ფანჯარაშიც.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setProblem(null);
              setGroup(emptyGroup);
            }}
            data-testid="button-add-price-group"
          >
            <Plus className="w-4 h-4 mr-2" />
            ახალი ჯგუფი
          </Button>
        </CardHeader>
      </Card>

      {isLoading && <p className="text-muted-foreground">იტვირთება…</p>}

      {menu.map((g, gi) => (
        <Card key={g.id} data-testid={`price-group-${g.id}`}>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 pb-3">
            <div className="min-w-0">
              <CardTitle className="text-lg">{g.titleKa}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {g.titleEn} · ფილტრში: {g.shortKa}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                aria-label="ჯგუფის აწევა"
                disabled={gi === 0 || reorder.isPending}
                onClick={() => {
                  const ids = moved(menu, gi, -1);
                  if (ids) reorder.mutate({ kind: "groups", ids });
                }}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="ჯგუფის ჩამოწევა"
                disabled={gi === menu.length - 1 || reorder.isPending}
                onClick={() => {
                  const ids = moved(menu, gi, 1);
                  if (ids) reorder.mutate({ kind: "groups", ids });
                }}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="ჯგუფის რედაქტირება"
                onClick={() => {
                  setProblem(null);
                  setGroup({ id: g.id, titleKa: g.titleKa, titleEn: g.titleEn, shortKa: g.shortKa, shortEn: g.shortEn });
                }}
                data-testid={`button-edit-group-${g.id}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                aria-label="ჯგუფის წაშლა"
                onClick={() => {
                  const count = g.items.length;
                  const warning = count
                    ? `წაიშალოს ჯგუფი „${g.titleKa}“ და მისი ${count} პროცედურა? ეს ვერ დაბრუნდება.`
                    : `წაიშალოს ჯგუფი „${g.titleKa}“?`;
                  if (confirm(warning)) deleteGroup.mutate(g.id);
                }}
                data-testid={`button-delete-group-${g.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {g.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">ამ ჯგუფში ჯერ პროცედურა არ არის — საიტზე არ გამოჩნდება.</p>
            ) : (
              <ul className="divide-y rounded-md border">
                {g.items.map((it, ii) => (
                  <li key={it.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5" data-testid={`price-item-${it.id}`}>
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="font-medium break-words">{it.nameKa}</p>
                      <p className="text-xs text-muted-foreground break-words">
                        {it.nameEn} · {serviceLabel(it.booking)}
                        {it.durationMin ? ` · ${it.durationMin} წთ` : ""}
                      </p>
                    </div>
                    <span className="font-medium tabular-nums w-16 text-right" data-testid={`price-item-price-${it.id}`}>
                      {it.price} ₾
                    </span>
                    <div className="flex items-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        aria-label="აწევა"
                        disabled={ii === 0 || reorder.isPending}
                        onClick={() => {
                          const ids = moved(g.items, ii, -1);
                          if (ids) reorder.mutate({ kind: "items", ids });
                        }}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        aria-label="ჩამოწევა"
                        disabled={ii === g.items.length - 1 || reorder.isPending}
                        onClick={() => {
                          const ids = moved(g.items, ii, 1);
                          if (ids) reorder.mutate({ kind: "items", ids });
                        }}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        aria-label="რედაქტირება"
                        onClick={() => openItem(g, it)}
                        data-testid={`button-edit-item-${it.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        aria-label="წაშლა"
                        onClick={() => confirm(`წაიშალოს „${it.nameKa}“?`) && deleteItem.mutate(it.id)}
                        data-testid={`button-delete-item-${it.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" onClick={() => openItem(g)} data-testid={`button-add-item-${g.id}`}>
              <Plus className="w-4 h-4 mr-1.5" />
              პროცედურის დამატება
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Group */}
      <Dialog open={!!group} onOpenChange={(open) => !open && setGroup(null)}>
        <DialogContent data-testid="dialog-price-group">
          <DialogHeader>
            <DialogTitle>{group?.id ? "ჯგუფის რედაქტირება" : "ახალი ჯგუფი"}</DialogTitle>
            <DialogDescription>ჯგუფი აერთიანებს პროცედურებს ფასების სიაში, მაგ. „ლაზერი — ქალბატონები“.</DialogDescription>
          </DialogHeader>
          {group && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="სათაური (ქართულად)" value={group.titleKa} onChange={(v) => setGroup({ ...group, titleKa: v })} testId="input-group-title-ka" />
              <Field label="სათაური (ინგლისურად)" value={group.titleEn} onChange={(v) => setGroup({ ...group, titleEn: v })} testId="input-group-title-en" />
              <Field
                label="მოკლე სახელი (ქართულად)"
                hint="ჩანს ფილტრში და დაჯავშნისას, მაგ. „ლაზერი · ქალი“"
                value={group.shortKa}
                onChange={(v) => setGroup({ ...group, shortKa: v })}
                testId="input-group-short-ka"
              />
              <Field
                label="მოკლე სახელი (ინგლისურად)"
                hint="მაგ. „Laser · Women“"
                value={group.shortEn}
                onChange={(v) => setGroup({ ...group, shortEn: v })}
                testId="input-group-short-en"
              />
            </div>
          )}
          {problem && <p className="text-sm text-destructive" role="alert">{problem}</p>}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setGroup(null)}>
              გაუქმება
            </Button>
            <Button onClick={submitGroup} disabled={saveGroup.isPending} data-testid="button-save-group">
              {saveGroup.isPending ? "ინახება…" : "შენახვა"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Treatment */}
      <Dialog open={!!item} onOpenChange={(open) => !open && setItem(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto" data-testid="dialog-price-item">
          <DialogHeader>
            <DialogTitle>{item?.id ? "პროცედურის რედაქტირება" : "ახალი პროცედურა"}</DialogTitle>
            <DialogDescription>ფასი და სახელი საიტზე ორივე ენაზე ჩანს.</DialogDescription>
          </DialogHeader>
          {item && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="სახელი (ქართულად)" value={item.nameKa} onChange={(v) => setItem({ ...item, nameKa: v })} testId="input-item-name-ka" />
              <Field label="სახელი (ინგლისურად)" value={item.nameEn} onChange={(v) => setItem({ ...item, nameEn: v })} testId="input-item-name-en" />
              <Field
                label="ფასი (₾)"
                inputMode="numeric"
                value={item.price}
                onChange={(v) => setItem({ ...item, price: v.replace(/[^\d]/g, "") })}
                testId="input-item-price"
              />
              <Field
                label="ხანგრძლივობა (წუთი)"
                hint="არასავალდებულო — თუ მიუთითებთ, ფასთან ერთად გამოჩნდება"
                inputMode="numeric"
                value={item.durationMin}
                onChange={(v) => setItem({ ...item, durationMin: v.replace(/[^\d]/g, "") })}
                testId="input-item-duration"
              />
              <div className="space-y-2">
                <Label>სერვისი</Label>
                <Select value={item.booking} onValueChange={(v) => setItem({ ...item, booking: v })}>
                  <SelectTrigger data-testid="select-item-service">
                    <SelectValue placeholder="აირჩიეთ" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookingCategories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.labelKa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">განსაზღვრავს, რომელი სპეციალისტები ასრულებენ ამ პროცედურას.</p>
              </div>
              <div className="space-y-2">
                <Label>ჯგუფი</Label>
                <Select value={item.groupId} onValueChange={(v) => setItem({ ...item, groupId: v })}>
                  <SelectTrigger data-testid="select-item-group">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {menu.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.titleKa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {problem && <p className="text-sm text-destructive" role="alert">{problem}</p>}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setItem(null)}>
              გაუქმება
            </Button>
            <Button onClick={submitItem} disabled={saveItem.isPending} data-testid="button-save-item">
              {saveItem.isPending ? "ინახება…" : "შენახვა"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  testId,
  inputMode,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  testId: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={testId}>{label}</Label>
      <Input id={testId} value={value} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
