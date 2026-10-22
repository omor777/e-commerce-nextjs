"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/axios";
import { AdminProductFormValues } from "@/queries/product.queries";
import {
  CreateProductInput,
  CreateProductOutput,
  createProductSchema,
} from "@/schemas/product.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageUploader } from "./image-uploader";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

type ProductFormProps = {
  categories: { id: string; name: string }[];
  initialData?: AdminProductFormValues;
  isEditMode?: boolean;
};

export function ProductForm({
  categories,
  initialData,
  isEditMode = false,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProductInput, unknown, CreateProductOutput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          categoryId: initialData.categoryId,
          isActive: initialData.isActive,
          images: initialData.images || [],
          variants: initialData.variants.map((v) => ({
            sku: v.sku,
            size: v.size,
            color: v.color,
            price: v.price,
            stock: v.stock,
            isActive: v.isActive,
          })),
        }
      : {
          name: "",
          description: "",
          categoryId: "",
          isActive: true,
          images: [], // 🔄 NEW: Default to empty array
          variants: [
            {
              sku: "",
              size: "M", // 🔄 CHANGED: Default to M for consistency with append
              color: "",
              price: 0,
              stock: 0,
              isActive: true,
            },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const categoryDropdownItems = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  async function onSubmit(values: CreateProductOutput) {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await api.patch(`/products/${initialData?.id}`, values);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", values);
        toast.success("Product created successfully");
      }

      form.reset();
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.error?.message ||
          `Failed to ${isEditMode ? "update" : "create"} product`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8"
      noValidate
    >
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Basic Details</h2>

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Product Name *</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. Premium Cotton Polo"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Product details..."
                className="min-h-25"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                  <Select
                    items={categoryDropdownItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />
        </div>

        {/* 🔄 NEW: Image Uploader */}
        <Controller
          name="images"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Product Images</FieldLabel>
              <ImageUploader
                value={field.value || []}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <Field className="flex flex-row items-center justify-between rounded-lg border border-border p-4 mt-4 bg-muted/10">
              <div className="space-y-0.5">
                <FieldLabel htmlFor={field.name} className="text-base">
                  Active Status
                </FieldLabel>
                <p className="text-sm text-muted-foreground">
                  Set to Draft to hide this product from the storefront.
                </p>
              </div>
              <Switch
                id={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Variants</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                sku: "",
                size: "M",
                color: "",
                price: 0,
                stock: 0,
                isActive: true,
              })
            }
          >
            <Plus className="size-4 mr-2" /> Add Variant
          </Button>
        </div>

        <div className="space-y-6">
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="relative border border-border p-4 rounded-md bg-muted/20"
            >
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-3" />
                </Button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-2">
                <Controller
                  name={`variants.${index}.sku`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>SKU *</FieldLabel>
                      <Input
                        {...field}
                        placeholder="POLO-BLK-M"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`variants.${index}.size`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Size *</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`variants.${index}.color`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Color *</FieldLabel>
                      <Input
                        {...field}
                        placeholder="Black"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`variants.${index}.price`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Price (৳) *</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="5"
                        aria-invalid={fieldState.invalid}
                        value={(field.value as number | undefined) ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`variants.${index}.stock`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Stock *</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        aria-invalid={fieldState.invalid}
                        value={(field.value as number | undefined) ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`variants.${index}.isActive`}
                  control={form.control}
                  render={({ field }) => (
                    <Field className="flex flex-col justify-end h-full pb-1">
                      <FieldLabel className="text-xs text-muted-foreground mb-1">
                        Status
                      </FieldLabel>
                      <div className="flex items-center gap-2 h-9">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          {field.value ? "Active" : "Draft"}
                        </span>
                      </div>
                    </Field>
                  )}
                />
              </div>
            </div>
          ))}
          {form.formState.errors.variants?.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.variants.root.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin mr-2 size-4" />}
          {isEditMode ? "Update Product" : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
