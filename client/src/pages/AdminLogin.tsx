import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Wordmark from "@/components/Wordmark";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(() =>
    new URLSearchParams(window.location.search).has("expired") ? "სესია დასრულდა. გთხოვთ, ხელახლა შეხვიდეთ." : ""
  );

  // Already logged in (e.g. opened from a bookmark): go straight to the dashboard
  const { data: authData } = useQuery<{ authenticated: boolean }>({ queryKey: ["/api/admin/check"] });
  useEffect(() => {
    if (authData?.authenticated) setLocation("/admin/dashboard");
  }, [authData, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Invalidate auth check to refresh authentication state
        await queryClient.invalidateQueries({ queryKey: ["/api/admin/check"] });
        setLocation("/admin/dashboard");
      } else {
        const errorMessage = response.status === 401 ? "მომხმარებელი ან პაროლი არასწორია." : "შესვლა ვერ მოხერხდა. სცადეთ ხელახლა.";
        setError(errorMessage);
        toast({
          title: "შესვლა ვერ მოხერხდა",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = "შესვლა ვერ მოხერხდა. შეამოწმეთ ინტერნეტი და სცადეთ ხელახლა.";
      setError(errorMessage);
      toast({
        title: "შეცდომა",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-none bg-theme-accent/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-theme-accent" />
          </div>
          <CardTitle className="text-2xl font-light tracking-normal">
            <Wordmark />
          </CardTitle>
          <CardDescription className="tracking-normal uppercase text-xs">
            მართვის პანელი
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-none" data-testid="error-message">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">მომხმარებელი</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="მომხმარებლის სახელი"
                autoComplete="username"
                required
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">პაროლი</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="პაროლი"
                autoComplete="current-password"
                required
                data-testid="input-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-theme-accent"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "შესვლა…" : "შესვლა"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
