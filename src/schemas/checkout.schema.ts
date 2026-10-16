import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.email("Must be a valid email address."),
  phone: z.string().trim().min(1, "Phone is required.").max(30),
  fullName: z.string().trim().min(1, "Full name is required.").max(100),
  line1: z.string().trim().min(1, "Address line 1 is required.").max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, "City is required.").max(100),
  state: z.string().trim().min(1, "State is required.").max(100),
  postalCode: z.string().trim().min(1, "Postal code is required.").max(20),
  country: z.string().trim().min(1, "Country is required.").max(100),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
