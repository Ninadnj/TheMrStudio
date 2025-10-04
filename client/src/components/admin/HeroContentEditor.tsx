import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHeroContentSchema, type HeroContent } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function HeroContentEditor() {
  const { toast } = useToast();

  const { data: heroContent } = useQuery<HeroContent>({
    queryKey: ["/api/admin/hero-content"],
  });

  const form = useForm({
    resolver: zodResolver(insertHeroContentSchema),
    defaultValues: {
      mainTitle: heroContent?.mainTitle || "",
      subtitle: heroContent?.subtitle || "",
      description: heroContent?.description || "",
      tagline: heroContent?.tagline || "",
    },
    values: heroContent ? {
      mainTitle: heroContent.mainTitle,
      subtitle: heroContent.subtitle,
      description: heroContent.description,
      tagline: heroContent.tagline,
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", "/api/admin/hero-content", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hero-content"] });
      toast({
        title: "Success",
        description: "Hero content updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update hero content",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Section Content</CardTitle>
        <CardDescription>Update the main hero section text and branding</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="mainTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="THE MR" data-testid="input-main-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nail & Laser Studio" data-testid="input-subtitle" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Where Beauty Meets Precision" data-testid="input-tagline" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Expert nail artistry..." data-testid="textarea-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="bg-theme-accent"
              disabled={updateMutation.isPending}
              data-testid="button-save-hero"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
