import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-5">
      <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-[0_28px_90px_-70px_rgba(0,0,0,0.65)]">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--theme-accent)]/20 bg-[var(--theme-accent)]/10">
            <Home className="h-6 w-6 text-[var(--theme-accent)]" strokeWidth={1.7} />
          </div>

          <h1 className="font-display text-3xl text-foreground tracking-normal">
            გვერდი ვერ მოიძებნა
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            ეს მისამართი აღარ არსებობს ან დროებით მიუწვდომელია.
          </p>

          <Button asChild className="mt-7 rounded-full bg-[var(--theme-accent)] text-[var(--theme-on-accent)] hover:bg-[var(--theme-accent-hover)]">
            <Link href="/">მთავარზე დაბრუნება</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
