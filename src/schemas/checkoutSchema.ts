import { z } from 'zod';

export const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  streetAddress: z.string().min(5, 'Please enter your street address'),
  city: z.string().min(2, 'Please enter your city'),
  state: z.string().min(2, 'Please enter your state'),
  postalCode: z.string().min(5, 'Please enter a valid postal code'),
  country: z.string().min(2, 'Please select a country'),
  customerNotes: z.string().optional(),
  paymentMethod: z.string().min(1, 'Please select a payment method'),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
