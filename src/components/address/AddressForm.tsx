import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Save } from 'lucide-react';

const addressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  street_address: z.string().min(5, 'Please enter your street address'),
  city: z.string().min(2, 'Please enter your city'),
  state: z.string().min(2, 'Please enter your state'),
  postal_code: z.string().min(5, 'Please enter a valid postal code'),
  country: z.string().min(2, 'Please select a country'),
  is_default: z.boolean().default(false)
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => Promise<void>;
  isSubmitting?: boolean;
  initialData?: Partial<AddressFormData>;
}

const AddressForm: React.FC<AddressFormProps> = ({ onSubmit, isSubmitting = false, initialData }) => {
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      street_address: initialData?.street_address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      postal_code: initialData?.postal_code || '',
      country: initialData?.country || '',
      is_default: initialData?.is_default || false
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neon-cyan font-space font-semibold text-lg">Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your full name" 
                  className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan transition-all duration-300 rounded-xl h-12 text-lg backdrop-blur-sm"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neon-purple font-space font-semibold text-lg">Phone Number</FormLabel>
              <FormControl>
                <Input 
                  type="tel"
                  placeholder="Enter your phone number" 
                  className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-purple transition-all duration-300 rounded-xl h-12 text-lg backdrop-blur-sm"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="street_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neon-pink font-space font-semibold text-lg">Street Address</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your street address" 
                  className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-pink transition-all duration-300 rounded-xl h-12 text-lg backdrop-blur-sm"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neon-orange font-space font-semibold text-lg">City</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your city" 
                    className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-orange transition-all duration-300 rounded-xl h-12 text-lg backdrop-blur-sm"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neon-cyan font-space font-semibold text-lg">State</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your state" 
                    className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan transition-all duration-300 rounded-xl h-12 text-lg backdrop-blur-sm"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neon-purple font-space font-semibold text-lg">Postal Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your postal code" 
                    className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-purple transition-all duration-300 rounded-xl h-12 text-lg backdrop-blur-sm"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neon-pink font-space font-semibold text-lg">Country</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your country" 
                    className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-pink transition-all duration-300 rounded-xl h-12 text-lg backdrop-blur-sm"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="group relative w-full md:w-auto h-14 text-lg font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02] disabled:opacity-70"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink p-[2px] group-hover:from-neon-purple group-hover:via-neon-pink group-hover:to-neon-orange transition-all duration-500">
            <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
          </div>
          <div className="relative z-10 flex items-center justify-center gap-3 h-full px-8">
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                <span className="text-lg font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                  SAVING...
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Save className="h-6 w-6 text-neon-cyan group-hover:text-neon-pink transition-colors duration-300" />
                <span className="text-lg font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent group-hover:from-neon-purple group-hover:via-neon-pink group-hover:to-neon-orange transition-all duration-500">
                  SAVE ADDRESS
                </span>
              </div>
            )}
          </div>
        </Button>
      </form>
    </Form>
  );
};

export default AddressForm; 