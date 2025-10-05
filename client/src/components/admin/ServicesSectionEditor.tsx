import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServicesSectionSchema, type ServicesSection } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function ServicesSectionEditor() {
  const { toast } = useToast();

  const { data: servicesSection } = useQuery<ServicesSection>({
    queryKey: ["/api/admin/services-section"],
  });

  const parseDescriptions = (descriptionsJson: string) => {
    try {
      const parsed = JSON.parse(descriptionsJson);
      return {
        manicurePedicure: parsed["მანიკური / პედიკური"] || "",
        laserEpilation: parsed["ლაზერული ეპილაცია"] || "",
        cosmetology: parsed["კოსმეტოლოგია"] || "",
      };
    } catch {
      return {
        manicurePedicure: "",
        laserEpilation: "",
        cosmetology: "",
      };
    }
  };

  const descriptions = servicesSection
    ? parseDescriptions(servicesSection.categoryDescriptions)
    : { manicurePedicure: "", laserEpilation: "", cosmetology: "" };

  const form = useForm({
    resolver: zodResolver(
      insertServicesSectionSchema.extend({
        manicurePedicure: insertServicesSectionSchema.shape.categoryDescriptions,
        laserEpilation: insertServicesSectionSchema.shape.categoryDescriptions,
        cosmetology: insertServicesSectionSchema.shape.categoryDescriptions,
      }).omit({ categoryDescriptions: true })
    ),
    defaultValues: {
      title: servicesSection?.title || "",
      subtitle: servicesSection?.subtitle || "",
      manicurePedicure: descriptions.manicurePedicure,
      laserEpilation: descriptions.laserEpilation,
      cosmetology: descriptions.cosmetology,
    },
    values: servicesSection ? {
      title: servicesSection.title,
      subtitle: servicesSection.subtitle,
      manicurePedicure: descriptions.manicurePedicure,
      laserEpilation: descriptions.laserEpilation,
      cosmetology: descriptions.cosmetology,
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      const categoryDescriptions = JSON.stringify({
        "მანიკური / პედიკური": data.manicurePedicure,
        "ლაზერული ეპილაცია": data.laserEpilation,
        "კოსმეტოლოგია": data.cosmetology,
      });
      
      return apiRequest("PUT", "/api/admin/services-section", {
        title: data.title,
        subtitle: data.subtitle,
        categoryDescriptions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services-section"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services-section"] });
      toast({
        title: "Success",
        description: "Services section updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update services section",
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
        <CardTitle>Services Section Content</CardTitle>
        <CardDescription>Update the services section title and category descriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Title (Georgian)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ჩვენი სერვისები" data-testid="input-section-title" />
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
                  <FormLabel>Section Subtitle (English)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Our Services" data-testid="input-section-subtitle" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-4">Category Descriptions</h3>
              
              <FormField
                control={form.control}
                name="manicurePedicure"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>მანიკური / პედიკური Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Professional nail care using premium gel polishes..." 
                        data-testid="textarea-manicure-description"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="laserEpilation"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>ლაზერული ეპილაცია Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Advanced laser hair removal technology..." 
                        data-testid="textarea-laser-description"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cosmetology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>კოსმეტოლოგია Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Professional skincare and beauty treatments..." 
                        data-testid="textarea-cosmetology-description"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="bg-theme-accent"
              disabled={updateMutation.isPending}
              data-testid="button-save-services-section"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
