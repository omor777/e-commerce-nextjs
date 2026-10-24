"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/axios";
import { CategoryFormValues } from "@/queries/category.queries";
import {
  createCategorySchema,
  CreateCategoryInput,
  CreateCategoryOutput,
} from "@/schemas/category.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type CategoryFormProps = {
  initialData?: CategoryFormValues;
  isEditMode?: boolean;
};

export function CategoryForm({
  initialData,
  isEditMode = false,
}: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCategoryInput, unknown, CreateCategoryOutput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          image: initialData.image || "",
          isActive: initialData.isActive,
        }
      : {
          name: "",
          description: "",
          image: "",
          isActive: true,
        },
  });

  async function onSubmit(values: CreateCategoryOutput) {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await api.patch(`/categories/${initialData?.id}`, values);
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", values);
        toast.success("Category created successfully");
      }

      form.reset();
      router.push("/admin/categories");
      router.refresh();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error?.message ||
          `Failed to ${isEditMode ? "update" : "create"} category`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Category Name *</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. T-Shirts"
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
                placeholder="Category description..."
                className="min-h-[100px]"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="image"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Image URL</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="https://..."
                aria-invalid={fieldState.invalid}
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
                  Set to Draft to hide this category from the storefront.
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
          {isEditMode ? "Update Category" : "Save Category"}
        </Button>
      </div>
    </form>
  );
}
