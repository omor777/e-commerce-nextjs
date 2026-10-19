"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCheckout } from "@/hooks/use-checkout"; // 🔄 IMPORT ADDED
import { formatPrice } from "@/lib/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, MapPin, User } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z.email("Must be a valid email address."),
  phone: z.string().trim().min(1, "Phone number is required."),
  line1: z.string().trim().min(1, "Address is required."),
  city: z.string().trim().min(1, "City is required."),
  altPhone: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

type CheckoutFormProps = {
  cartTotal: number;
};

export function CheckoutForm({ cartTotal }: CheckoutFormProps) {
  // 🔄 CHANGED: Use the custom hook
  const checkoutMutation = useCheckout();

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      line1: "",
      city: "",
      altPhone: "",
      note: "",
    },
  });

  const onSubmit = (values: CheckoutValues) => {
    // Map form values to the exact API structure
    checkoutMutation.mutate({
      email: values.email,
      phone: values.phone,
      fullName: values.fullName,
      line1: values.line1,
      line2: values.note || "",
      city: values.city,
      state: "N/A", // Update backend schema if you want to remove this
      postalCode: "0000", // Update backend schema if you want to remove this
      country: "Bangladesh",
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8"
      id="checkout-form"
      noValidate
    >
      {/* 1. Contact Information */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-foreground">
          <User className="size-5" />
          <h2 className="text-lg font-semibold">Contact Information</h2>
        </div>

        <div className="space-y-4">
          <Controller
            name="fullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Full Name *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="John Doe"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="john@example.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Phone Number *</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </div>
      </div>

      {/* 2. Shipping Address */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-foreground">
          <MapPin className="size-5" />
          <h2 className="text-lg font-semibold">Shipping Address</h2>
        </div>

        <div className="space-y-4">
          <Controller
            name="line1"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Detailed Address *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="House, Road, Area"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="city"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    City / District *
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dhaka">Dhaka</SelectItem>
                      <SelectItem value="Chittagong">Chittagong</SelectItem>
                      <SelectItem value="Sylhet">Sylhet</SelectItem>
                      <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                      <SelectItem value="Khulna">Khulna</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="altPhone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Alt. Phone</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="tel"
                    placeholder="01XXXXXXXXX (optional)"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="note"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Note for Delivery</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Special instructions (optional)"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </div>

      {/* Mobile Only Confirm Button */}
      <div className="md:hidden bg-card border border-border rounded-lg p-4 shadow-sm sticky bottom-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-muted-foreground">Total</span>
          <span className="font-bold text-lg">{formatPrice(cartTotal)}</span>
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-12"
          disabled={checkoutMutation.isPending}
        >
          {checkoutMutation.isPending ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <CheckCircle2 className="mr-2 size-5" />
          )}
          Confirm Order
        </Button>
      </div>
    </form>
  );
}
