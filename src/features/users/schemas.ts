import { z } from 'zod';

export const onboardingSchema = z.object({
	firstName: z.string().trim().min(1, 'First name is required'),
	lastName: z.string().trim().min(1, 'Last name is required'),
	phone: z
		.string()
		.trim()
		.optional()
		.refine((value) => !value || /^[6-9]\d{9}$/.test(value), {
			message: 'Enter a valid 10-digit Indian mobile number',
		}),
	role: z.enum(['CUSTOMER', 'OWNER'], {
		message: 'Select User or Owner',
	}),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const profileSchema = z.object({
	firstName: z.string().trim().min(1, 'First name is required'),
	lastName: z.string().trim().min(1, 'Last name is required'),
	phone: z
		.string()
		.trim()
		.min(1, 'Phone is required')
		.refine((value) => /^[6-9]\d{9}$/.test(value), {
			message: 'Enter a valid 10-digit Indian mobile number',
		}),
});

export type ProfileValues = z.infer<typeof profileSchema>;
