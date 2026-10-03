import { useMutation, useQuery } from "@tanstack/react-query";
import type { UploadResult } from "@uppy/core";
import { RotateCcw, Upload } from "lucide-react";
import type { HeroContent } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isVideoUrl } from "@/lib/videoUtils";
import { ObjectUploader } from "@/components/ObjectUploader";

/** The site's own artwork, shown whenever no custom image is set. */
const DEFAULT_HERO = "/images/hero-768.webp";

/**
 * The hero is the studio's name over one image. Only the image is editable here;
 * the old title/subtitle/tagline fields are no longer shown on the site.
 */
export default function HeroContentEditor() {
  const { toast } = useToast();
  const { data: heroContent, isLoading } = useQuery<HeroContent>({
    queryKey: ["/api/admin/hero-content"],
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/hero-content"] });
    queryClient.invalidateQueries({ queryKey: ["/api/hero-content"] });
  };

  const setImage = useMutation({
    mutationFn: (imageUrl: string) => apiRequest("PUT", "/api/admin/hero/background-image", { imageUrl }),
    onSuccess: () => {
      refresh();
      toast({ title: "მთავარი ფოტო განახლდა", description: "საიტზე უკვე ჩანს." });
    },
    onError: () => toast({ title: "ფოტო ვერ შეინახა", description: "სცადეთ ხელახლა.", variant: "destructive" }),
  });

  const useDefault = useMutation({
    // Same record, image cleared — the text fields are kept as they are
    mutationFn: () => {
      const { id: _id, ...rest } = heroContent!;
      return apiRequest("PUT", "/api/admin/hero-content", { ...rest, backgroundImage: null });
    },
    onSuccess: () => {
      refresh();
      toast({ title: "დაბრუნდა საიტის ძირითადი ილუსტრაცია" });
    },
    onError: () => toast({ title: "ვერ მოხერხდა", description: "სცადეთ ხელახლა.", variant: "destructive" }),
  });

  const onUploaded = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    const path = result.successful?.[0]?.response?.body?.uploadURL as string | undefined;
    if (path) setImage.mutate(path);
    else toast({ title: "ატვირთვა ვერ მოხერხდა", description: "სცადეთ JPG ან PNG ფაილი, 10 MB-მდე.", variant: "destructive" });
  };

  const custom = heroContent?.backgroundImage || null;
  const shown = custom || DEFAULT_HERO;

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>მთავარი ფოტო</CardTitle>
        <CardDescription>
          დიდი ფოტო მთავარი გვერდის ზედა ნაწილში. საუკეთესოდ ჩანს ვერტიკალური ფოტო (სიმაღლე მინიმუმ 1200px).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-[200px_1fr] sm:items-start">
          <div className="aspect-[4/5] overflow-hidden rounded-md border bg-muted">
            {!isLoading &&
              (isVideoUrl(shown) ? (
                <video src={shown} muted loop autoPlay playsInline className="h-full w-full object-cover" />
              ) : (
                <img src={shown} alt="ამჟამინდელი მთავარი ფოტო" className="h-full w-full object-cover" data-testid="img-hero-preview" />
              ))}
          </div>

          <div className="space-y-4">
            <p className="text-sm">
              <span className="text-muted-foreground">ახლა ჩანს: </span>
              <span className="font-medium" data-testid="text-hero-source">
                {custom ? "თქვენი ატვირთული ფოტო" : "საიტის ძირითადი ილუსტრაცია"}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <ObjectUploader maxNumberOfFiles={1} maxFileSize={10485760} onComplete={onUploaded}>
                <Upload className="w-4 h-4 mr-2" />
                {custom ? "ფოტოს შეცვლა" : "ფოტოს ატვირთვა"}
              </ObjectUploader>
              {custom && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => useDefault.mutate()}
                  disabled={useDefault.isPending || !heroContent}
                  data-testid="button-hero-default"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  ძირითადი ილუსტრაციის დაბრუნება
                </Button>
              )}
            </div>
            {setImage.isPending && <p className="text-sm text-muted-foreground">ინახება…</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
