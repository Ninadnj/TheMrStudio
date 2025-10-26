import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGalleryImageSchema, type GalleryImage } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

const GALLERY_CATEGORIES = [
  { value: "ფრჩხილები", label: "ფრჩხილები (Nails)" },
  { value: "ლაზერი", label: "ლაზერი (Laser)" },
  { value: "კოსმეტოლოგია", label: "კოსმეტოლოგია (Cosmetology)" },
];

export default function GalleryEditor() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: images = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/admin/gallery"],
  });

  const form = useForm({
    resolver: zodResolver(insertGalleryImageSchema),
    defaultValues: {
      category: "",
      imageUrl: "",
      order: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/gallery", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "წარმატება", description: "ფოტო დაემატა გალერეას" });
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/admin/gallery/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "წარმატება", description: "ფოტო განახლდა" });
      setEditingId(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "წარმატება", description: "ფოტო წაიშალა" });
    },
  });

  const onSubmit = (data: any) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    form.reset({
      category: image.category,
      imageUrl: image.imageUrl,
      order: image.order,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({
      category: "",
      imageUrl: "",
      order: "",
    });
  };

  const groupedImages = images.reduce((acc, image) => {
    if (!acc[image.category]) {
      acc[image.category] = [];
    }
    acc[image.category].push(image);
    return acc;
  }, {} as Record<string, GalleryImage[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Gallery Image" : "Add New Image"}</CardTitle>
          <CardDescription>Upload photos to your gallery categories</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="აირჩიეთ კატეგორია" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GALLERY_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <Input {...field} placeholder="1" data-testid="input-order" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-image-url" />
                      </FormControl>
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={10485760}
                        onGetUploadParameters={async () => {
                          const response = await apiRequest("POST", "/api/objects/upload", {});
                          return {
                            method: "PUT" as const,
                            url: response.uploadURL,
                          };
                        }}
                        onComplete={async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                          if (result.successful && result.successful.length > 0) {
                            const objectPath = result.successful[0]?.uploadURL?.split('?')[0].split('/').slice(-2).join('/');
                            const publicUrl = `/objects/${objectPath}`;
                            form.setValue("imageUrl", publicUrl);
                            toast({ 
                              title: "წარმატება", 
                              description: "ფოტო აიტვირთა" 
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

              {form.watch("imageUrl") && (
                <div className="rounded-md overflow-hidden border border-border">
                  <img
                    src={form.watch("imageUrl")}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-theme-accent"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-image"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {editingId ? "Update Image" : "Add Image"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Images</CardTitle>
          <CardDescription>{images.length} images in gallery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {GALLERY_CATEGORIES.map((cat) => {
              const categoryImages = groupedImages[cat.value] || [];
              return (
                <div key={cat.value}>
                  <h3 className="text-lg font-semibold mb-4">{cat.label}</h3>
                  {categoryImages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No images in this category</p>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {categoryImages
                        .sort((a, b) => parseInt(a.order) - parseInt(b.order))
                        .map((image) => (
                          <div key={image.id} className="space-y-2">
                            <div className="aspect-square rounded-md overflow-hidden bg-muted border border-border relative group">
                              <img
                                src={image.imageUrl}
                                alt={`${cat.value} ${image.order}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleEdit(image)}
                                  data-testid={`button-edit-${image.id}`}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteMutation.mutate(image.id)}
                                  disabled={deleteMutation.isPending}
                                  data-testid={`button-delete-${image.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">Order: {image.order}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
