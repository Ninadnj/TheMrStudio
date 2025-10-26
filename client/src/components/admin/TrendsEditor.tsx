import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertTrendSchema, 
  type Trend, 
  type InsertTrend,
  type TrendsSection,
  type InsertTrendsSection 
} from "@shared/schema";
import { Plus, Edit, Trash2, Save, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

export default function TrendsEditor() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const currentUploadUrlRef = useRef<string>("");
  const { toast } = useToast();

  const { data: trends = [], isLoading } = useQuery<Trend[]>({
    queryKey: ["/api/admin/trends"],
  });

  const { data: sectionData } = useQuery<TrendsSection>({
    queryKey: ["/api/trends-section"],
  });

  const [headingTitle, setHeadingTitle] = useState("");
  const [headingSubtitle, setHeadingSubtitle] = useState("");

  const form = useForm<InsertTrend>({
    resolver: zodResolver(insertTrendSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      category: "",
      order: "1",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTrend) => {
      console.log("[TrendsEditor] Creating trend with data:", data);
      return await apiRequest("POST", "/api/admin/trends", data);
    },
    onSuccess: async (createdTrend: any) => {
      console.log("[TrendsEditor] Trend created:", createdTrend);
      // Always set ACL policy and get stable URL for uploaded images
      if (createdTrend.imageUrl) {
        console.log("[TrendsEditor] Setting ACL policy for image:", createdTrend.imageUrl);
        try {
          const aclResponse = await apiRequest("PUT", `/api/admin/trends/${createdTrend.id}/image`, {
            imageUrl: createdTrend.imageUrl,
          });
          console.log("[TrendsEditor] ACL policy set, response:", aclResponse);
        } catch (error) {
          console.error("Failed to set ACL policy:", error);
        }
      } else {
        console.warn("[TrendsEditor] No imageUrl in created trend, skipping ACL");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trends"] });
      toast({
        title: "Success",
        description: "Trend created successfully",
      });
      form.reset();
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create trend",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTrend> }) => {
      console.log("[TrendsEditor] Updating trend", id, "with data:", data);
      return await apiRequest("PUT", `/api/admin/trends/${id}`, data);
    },
    onSuccess: async (updatedTrend: any, variables) => {
      console.log("[TrendsEditor] Trend updated:", updatedTrend);
      // Always set ACL policy and get stable URL for uploaded images
      if (updatedTrend.imageUrl) {
        console.log("[TrendsEditor] Setting ACL policy for updated image:", updatedTrend.imageUrl);
        try {
          const aclResponse = await apiRequest("PUT", `/api/admin/trends/${variables.id}/image`, {
            imageUrl: updatedTrend.imageUrl,
          });
          console.log("[TrendsEditor] ACL policy set, response:", aclResponse);
        } catch (error) {
          console.error("Failed to set ACL policy:", error);
        }
      } else {
        console.warn("[TrendsEditor] No imageUrl in updated trend, skipping ACL");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trends"] });
      toast({
        title: "Success",
        description: "Trend updated successfully",
      });
      setEditingId(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update trend",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/trends/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trends"] });
      toast({
        title: "Success",
        description: "Trend deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete trend",
        variant: "destructive",
      });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async (data: InsertTrendsSection) => {
      return await apiRequest("PUT", "/api/admin/trends-section", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trends-section"] });
      toast({
        title: "Success",
        description: "Section heading updated successfully",
      });
      setIsEditingHeading(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update section heading",
        variant: "destructive",
      });
    },
  });

  // Initialize heading form values when sectionData loads
  useEffect(() => {
    if (sectionData) {
      setHeadingTitle(sectionData.title || "რა არის ახლა ტრენდში");
      setHeadingSubtitle(sectionData.subtitle || "What's Trendy Now");
    }
  }, [sectionData]);

  const handleEditHeading = () => {
    setIsEditingHeading(true);
  };

  const handleCancelHeading = () => {
    setIsEditingHeading(false);
    // Reset to original values
    if (sectionData) {
      setHeadingTitle(sectionData.title || "რა არის ახლა ტრენდში");
      setHeadingSubtitle(sectionData.subtitle || "What's Trendy Now");
    }
  };

  const handleSaveHeading = () => {
    updateSectionMutation.mutate({
      title: headingTitle,
      subtitle: headingSubtitle,
    });
  };

  const handleEdit = (trend: Trend) => {
    setEditingId(trend.id);
    setIsCreating(false);
    form.reset({
      title: trend.title,
      description: trend.description,
      imageUrl: trend.imageUrl,
      category: trend.category,
      order: trend.order,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    form.reset();
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    form.reset({
      title: "",
      description: "",
      imageUrl: "",
      category: "",
      order: "1",
    });
  };

  const onSubmit = (data: InsertTrend) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else if (isCreating) {
      createMutation.mutate(data);
    }
  };

  const trendsByCategory = trends.reduce((acc, trend) => {
    if (!acc[trend.category]) {
      acc[trend.category] = [];
    }
    acc[trend.category].push(trend);
    return acc;
  }, {} as Record<string, Trend[]>);

  Object.keys(trendsByCategory).forEach(category => {
    trendsByCategory[category].sort((a, b) => a.order.localeCompare(b.order));
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading trends...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Section Heading Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Section Heading</CardTitle>
              <CardDescription>
                Customize the heading for the Trends section
              </CardDescription>
            </div>
            {!isEditingHeading ? (
              <Button
                onClick={handleEditHeading}
                variant="outline"
                data-testid="button-edit-heading"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveHeading}
                  disabled={updateSectionMutation.isPending}
                  data-testid="button-save-heading"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleCancelHeading}
                  variant="outline"
                  disabled={updateSectionMutation.isPending}
                  data-testid="button-cancel-heading"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        {isEditingHeading && (
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Main Title (Georgian)
              </label>
              <Input
                value={headingTitle}
                onChange={(e) => setHeadingTitle(e.target.value)}
                placeholder="რა არის ახლა ტრენდში"
                data-testid="input-heading-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Subtitle (English)
              </label>
              <Input
                value={headingSubtitle}
                onChange={(e) => setHeadingSubtitle(e.target.value)}
                placeholder="What's Trendy Now"
                data-testid="input-heading-subtitle"
              />
            </div>
          </CardContent>
        )}
        {!isEditingHeading && (
          <CardContent>
            <div className="text-center py-2">
              <p className="text-lg font-medium">{headingTitle || "რა არის ახლა ტრენდში"}</p>
              {headingSubtitle && (
                <p className="text-sm text-muted-foreground">{headingSubtitle}</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Trends Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trends Management</CardTitle>
              <CardDescription>
                Manage what's trendy now - lookbooks, nail trends, and seasonal highlights
              </CardDescription>
            </div>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              data-testid="button-create-trend"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Trend
            </Button>
          </div>
        </CardHeader>

        {(isCreating || editingId) && (
          <CardContent className="border-t pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Glazed Donut Nails"
                          data-testid="input-trend-title"
                        />
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
                        <Textarea
                          {...field}
                          placeholder="Describe the trend..."
                          rows={3}
                          data-testid="input-trend-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://images.unsplash.com/..."
                            data-testid="input-trend-image-url"
                          />
                        </FormControl>
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={10485760}
                          onGetUploadParameters={async () => {
                            const response = await apiRequest("POST", "/api/objects/upload", {});
                            // Save the URL in ref for later use in onComplete (avoids stale closure)
                            currentUploadUrlRef.current = response.uploadURL;
                            return {
                              method: "PUT" as const,
                              url: response.uploadURL,
                            };
                          }}
                          onComplete={async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                            if (result.successful && result.successful.length > 0) {
                              // Use the saved presigned URL from ref - ACL will be set after form submission
                              console.log("[TrendsEditor] Upload complete, using saved presigned URL:", currentUploadUrlRef.current);
                              form.setValue("imageUrl", currentUploadUrlRef.current);
                              toast({ 
                                title: "Success", 
                                description: "Image uploaded successfully" 
                              });
                            }
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </ObjectUploader>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Nail Trends, Lookbook"
                            data-testid="input-trend-category"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="1"
                            data-testid="input-trend-order"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-trend"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    data-testid="button-cancel-trend"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        )}
      </Card>

      {Object.keys(trendsByCategory).length === 0 && !isCreating && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No trends yet. Click "Add Trend" to create your first one.
            </p>
          </CardContent>
        </Card>
      )}

      {Object.keys(trendsByCategory).sort().map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-xl">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {trendsByCategory[category].map((trend) => (
                <div
                  key={trend.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover-elevate"
                  data-testid={`trend-item-${trend.id}`}
                >
                  <img
                    src={trend.imageUrl}
                    alt={trend.title}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1">{trend.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {trend.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Order: {trend.order}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(trend)}
                      disabled={editingId === trend.id}
                      data-testid={`button-edit-trend-${trend.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this trend?")) {
                          deleteMutation.mutate(trend.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-trend-${trend.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
