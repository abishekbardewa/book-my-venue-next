import { z } from 'zod';

export const payoutSetupSchema = z.object({
	legalBusinessName: z.string().trim().min(4, 'Business name is required').max(200),
	contactName: z.string().trim().min(4, 'Contact name is required').max(255),
	phone: z
		.string()
		.trim()
		.transform((value) => value.replace(/\D/g, ''))
		.pipe(z.string().min(8, 'Enter a valid phone').max(15, 'Enter a valid phone')),
	street1: z.string().trim().min(3, 'Street is required').max(200),
	street2: z.string().trim().max(200).optional().or(z.literal('')),
	city: z.string().trim().min(2, 'City is required').max(100),
	state: z.string().trim().min(2, 'State is required').max(100),
	postalCode: z.string().trim().min(4, 'Postal code is required').max(12),
	country: z.string().trim().min(2, 'Country is required').max(56).default('IN'),
	pan: z
		.string()
		.trim()
		.toUpperCase()
		.regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Enter a valid PAN'),
	bankAccountNumber: z.string().trim().min(5, 'Account number is required').max(35),
	bankIfsc: z
		.string()
		.trim()
		.toUpperCase()
		.regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC'),
	bankBeneficiaryName: z.string().trim().min(4, 'Beneficiary name is required').max(120),
});

export type PayoutSetupValues = z.infer<typeof payoutSetupSchema>;
