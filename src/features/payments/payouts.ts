import { eq } from 'drizzle-orm';
import { env } from '@/data/env/server';
import { db } from '@/drizzle/db';
import { PaymentTable, UserTable } from '@/drizzle/schema';
import {
	PLATFORM_FEE_PERCENT,
	splitPaymentAmount,
} from '@/features/payments/constants';
import { razorpay } from '@/features/payments/razorpay';
import type { AppUser } from '@/features/users/db';

export function arePayoutsEnabled() {
	return env.PAYOUTS_ENABLED;
}

export function ownerHasActivePayouts(
	user: Pick<AppUser, 'role' | 'payoutOnboardingStatus' | 'razorpayLinkedAccountId'>
) {
	if (!arePayoutsEnabled()) return true;
	if (user.role === 'PLATFORM_ADMIN') return true;
	return (
		user.payoutOnboardingStatus === 'ACTIVE' && Boolean(user.razorpayLinkedAccountId)
	);
}

export type SetupPayoutInput = {
	legalBusinessName: string;
	contactName: string;
	phone: string;
	street1: string;
	street2?: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	pan: string;
	bankAccountNumber: string;
	bankIfsc: string;
	bankBeneficiaryName: string;
};

function razorpayErrorMessage(error: unknown) {
	if (error && typeof error === 'object') {
		const err = error as {
			error?: { description?: string; reason?: string };
			message?: string;
		};
		return err.error?.description || err.error?.reason || err.message || 'Razorpay request failed';
	}
	return 'Razorpay request failed';
}

export async function setupOwnerPayouts(user: AppUser, input: SetupPayoutInput) {
	if (!arePayoutsEnabled()) {
		throw new Error('Payouts are not available yet');
	}
	if (user.role !== 'OWNER' && user.role !== 'PLATFORM_ADMIN') {
		throw new Error('Only owners can set up payouts');
	}
	if (user.payoutOnboardingStatus === 'ACTIVE' && user.razorpayLinkedAccountId) {
		return user;
	}

	const phoneDigits = input.phone.replace(/\D/g, '');
	let accountId = user.razorpayLinkedAccountId ?? null;

	try {
		if (!accountId) {
			const account = await razorpay.accounts.create({
				email: user.email,
				phone: phoneDigits,
				type: 'route',
				legal_business_name: input.legalBusinessName,
				business_type: 'individual',
				contact_name: input.contactName,
				profile: {
					category: 'housing',
					subcategory: 'real_estate',
					addresses: {
						registered: {
							street1: input.street1,
							street2: input.street2 || '',
							city: input.city,
							state: input.state.toUpperCase(),
							postal_code: input.postalCode,
							country: input.country.toUpperCase() === 'INDIA' ? 'IN' : input.country,
						},
					},
				},
				legal_info: {
					pan: input.pan.toUpperCase(),
				},
			});

			accountId = account.id;
		}

		const product = await razorpay.products.requestProductConfiguration(accountId, {
			product_name: 'route',
			tnc_accepted: true,
		});

		await razorpay.products.edit(accountId, product.id, {
			settlements: {
				account_number: input.bankAccountNumber,
				ifsc_code: input.bankIfsc.toUpperCase(),
				beneficiary_name: input.bankBeneficiaryName,
			},
			tnc_accepted: true,
		});

		const [updated] = await db
			.update(UserTable)
			.set({
				razorpayLinkedAccountId: accountId,
				payoutOnboardingStatus: 'ACTIVE',
				phone: user.phone || phoneDigits,
			})
			.where(eq(UserTable.id, user.id))
			.returning();

		return updated ?? user;
	} catch (error) {
		if (accountId) {
			await db
				.update(UserTable)
				.set({
					razorpayLinkedAccountId: accountId,
					payoutOnboardingStatus: 'NEEDS_DETAILS',
				})
				.where(eq(UserTable.id, user.id));
		}
		throw new Error(razorpayErrorMessage(error));
	}
}

export async function transferOwnerShareForBooking(input: {
	bookingId: string;
	paymentId: string;
	razorpayPaymentId: string;
	amount: string | number;
	currency: string;
	linkedAccountId: string;
}) {
	const [payment] = await db
		.select()
		.from(PaymentTable)
		.where(eq(PaymentTable.id, input.paymentId))
		.limit(1);

	if (!payment) {
		throw new Error('Payment not found');
	}
	if (payment.razorpayTransferId) {
		return payment;
	}

	const split = splitPaymentAmount(Number(input.amount));

	const transferResponse = await razorpay.payments.transfer(input.razorpayPaymentId, {
		transfers: [
			{
				account: input.linkedAccountId,
				amount: split.ownerSharePaise,
				currency: input.currency || 'INR',
				notes: {
					bookingId: input.bookingId,
					platformFeePercent: String(PLATFORM_FEE_PERCENT),
				},
				on_hold: false,
			},
		],
	});

	const transferId = transferResponse.items?.[0]?.id;
	if (!transferId) {
		throw new Error('Razorpay did not return a transfer id');
	}

	const [updated] = await db
		.update(PaymentTable)
		.set({
			platformFee: split.platformFee,
			ownerShare: split.ownerShare,
			razorpayTransferId: transferId,
		})
		.where(eq(PaymentTable.id, input.paymentId))
		.returning();

	return updated ?? payment;
}
