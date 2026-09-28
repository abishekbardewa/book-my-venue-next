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

const passwordSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(/[A-Z]/, 'Password must include one uppercase letter')
			.regex(passwordSpecialChar, 'Password must include one special character'),
		confirmPassword: z.string().min(1, 'Confirm your new password'),
	})
	.refine((value) => value.newPassword === value.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	})
	.refine((value) => value.currentPassword !== value.newPassword, {
		message: 'New password must be different from your current password',
		path: ['newPassword'],
	});

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
