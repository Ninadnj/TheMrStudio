import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import HeroContentEditor from "@/components/admin/HeroContentEditor";
import ServicesEditor from "@/components/admin/ServicesEditor";
import SiteSettingsEditor from "@/components/admin/SiteSettingsEditor";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: authData, isLoading } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  useEffect(() => {
    if (!isLoading && !authData?.authenticated) {
      setLocation("/admin/login");
    }
  }, [authData, isLoading, setLocation]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      setLocation("/admin/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!authData?.authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-wide">
              <span style={{ opacity: 0.3 }}>THE </span>
              <span className="font-bold">MR</span>
              <span className="text-sm ml-3 text-muted-foreground uppercase tracking-wider">Admin</span>
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="hero" data-testid="tab-hero">Hero Content</TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">Services</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <HeroContentEditor />
          </TabsContent>

          <TabsContent value="services">
            <ServicesEditor />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettingsEditor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
