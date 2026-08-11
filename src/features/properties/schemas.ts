import { z } from 'zod';

const optionalText = z.string().trim().optional();

export const propertyDraftSchema = z.object({
	id: z.string().uuid().optional(),
	propertyName: z.string().trim().min(1, 'Property name is required'),
	description: optionalText,
	capacity: optionalText,
	price: optionalText,
	checkInTime: optionalText,
	checkOutTime: optionalText,
	address: optionalText,
	city: optionalText,
	country: z.string().trim().optional().default('India'),
	pincode: optionalText,
	extraInfo: optionalText,
	tags: z.array(z.string().trim().min(1)).max(3).default([]),
	amenities: z.array(z.string().trim().min(1)).max(5).default([]),
});

export const propertySubmitSchema = z.object({
	id: z.string().uuid().optional(),
	propertyName: z.string().trim().min(1, 'Property name is required'),
	description: z.string().trim().min(1, 'Description is required').max(600),
	capacity: z.string().trim().min(1, 'Capacity is required'),
	price: z.string().trim().min(1, 'Price is required'),
	checkInTime: z.string().trim().min(1, 'Check-in time is required'),
	checkOutTime: z.string().trim().min(1, 'Check-out time is required'),
	address: z.string().trim().min(1, 'Address is required').max(300),
	city: z.string().trim().min(1, 'City is required'),
	country: z.string().trim().min(1).default('India'),
	pincode: z.string().trim().min(1, 'Pin code is required'),
	extraInfo: z.string().trim().max(400).optional(),
	tags: z.array(z.string().trim().min(1)).min(1, 'Select at least one category').max(3),
	amenities: z.array(z.string().trim().min(1)).max(5).default([]),
});

export type PropertyDraftValues = z.infer<typeof propertyDraftSchema>;
export type PropertySubmitValues = z.infer<typeof propertySubmitSchema>;
export type PropertyFormValues = PropertyDraftValues & {
	id?: string;
};
