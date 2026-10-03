import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ExternalLink, LogOut } from "lucide-react";
import type { Booking } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Wordmark from "@/components/Wordmark";
import HeroContentEditor from "@/components/admin/HeroContentEditor";
import SiteSettingsEditor from "@/components/admin/SiteSettingsEditor";
import { StaffEditor } from "@/components/admin/StaffEditor";
import GalleryEditor from "@/components/admin/GalleryEditor";
import SpecialOffersEditor from "@/components/admin/SpecialOffersEditor";
import { BookingsEditor, BOOKINGS_REFRESH_MS } from "@/components/admin/BookingsEditor";
import PricesEditor from "@/components/admin/PricesEditor";

const TABS = [
  { value: "bookings", label: "ჯავშნები" },
  { value: "prices", label: "ფასები" },
  { value: "staff", label: "სპეციალისტები" },
  { value: "gallery", label: "გალერეა" },
  { value: "offers", label: "აქციები" },
  { value: "hero", label: "მთავარი ფოტო" },
  { value: "settings", label: "პარამეტრები" },
] as const;
type TabValue = (typeof TABS)[number]["value"];

/** The open tab lives in the URL hash, so a refresh keeps the owner where she was. */
function tabFromHash(): TabValue {
  const hash = window.location.hash.slice(1);
  return TABS.some((t) => t.value === hash) ? (hash as TabValue) : "bookings";
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabValue>(tabFromHash);

  const { data: authData, isLoading } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  // Shared with BookingsEditor (same key): feeds the count on the tab.
  const { data: pending = [] } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings/pending"],
    enabled: !!authData?.authenticated,
    refetchInterval: BOOKINGS_REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!isLoading && !authData?.authenticated) {
      setLocation("/admin/login");
    }
  }, [authData, isLoading, setLocation]);

  const changeTab = (value: string) => {
    setTab(value as TabValue);
    window.history.replaceState(null, "", `#${value}`);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
      // Forget everything the session loaded, so "back" can't show stale admin data
      queryClient.removeQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("/api/admin") });
      queryClient.setQueryData(["/api/admin/check"], { authenticated: false });
      setLocation("/admin/login");
    } catch {
      toast({ title: "გასვლა ვერ მოხერხდა", description: "შეამოწმეთ ინტერნეტი და სცადეთ ხელახლა.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">იტვირთება…</p>
      </div>
    );
  }

  if (!authData?.authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-3 min-w-0">
            <Wordmark className="text-lg" />
            <span className="hidden sm:inline text-xs tracking-[0.12em] text-muted-foreground">მართვის პანელი</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer" aria-label="საიტის ნახვა" data-testid="link-view-site">
                <ExternalLink className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">საიტის ნახვა</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} aria-label="გასვლა" data-testid="button-logout">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">გასვლა</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <Tabs value={tab} onValueChange={changeTab} className="space-y-6">
          {/* One row: scrolls sideways on phones instead of squeezing the labels */}
          <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex h-auto w-max min-w-full justify-start gap-1 p-1">
              {TABS.map(({ value, label }) => (
                <TabsTrigger key={value} value={value} className="shrink-0 px-3 py-2" data-testid={`tab-${value}`}>
                  {label}
                  {value === "bookings" && pending.length > 0 && (
                    <span
                      className="ml-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground tabular-nums"
                      aria-label={`${pending.length} ელოდება`}
                      data-testid="badge-pending-count"
                    >
                      {pending.length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="bookings">
            <BookingsEditor />
          </TabsContent>
          <TabsContent value="prices">
            <PricesEditor />
          </TabsContent>
          <TabsContent value="gallery">
            <GalleryEditor />
          </TabsContent>
          <TabsContent value="offers">
            <SpecialOffersEditor />
          </TabsContent>
          <TabsContent value="staff">
            <StaffEditor />
          </TabsContent>
          <TabsContent value="hero">
            <HeroContentEditor />
          </TabsContent>
          <TabsContent value="settings">
            <SiteSettingsEditor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
