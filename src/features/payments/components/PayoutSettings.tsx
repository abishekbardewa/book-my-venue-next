'use client';

import { useActionState } from 'react';
import {
	setupPayoutsAction,
	type PayoutSetupActionState,
} from '@/features/payments/actions';
import { PLATFORM_FEE_PERCENT } from '@/features/payments/constants';
import type { AppUser, PublicAppUser } from '@/features/users/db';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PayoutSettingsProps = {
	user: PublicAppUser;
};

const initialState: PayoutSetupActionState = {};

function statusLabel(status: AppUser['payoutOnboardingStatus']) {
	switch (status) {
		case 'ACTIVE':
			return 'Payouts active';
		case 'PENDING':
			return 'Payouts pending';
		case 'NEEDS_DETAILS':
			return 'Details needed';
		default:
			return 'Set up payouts';
	}
}

export function PayoutSettings({ user }: PayoutSettingsProps) {
	const [state, formAction, pending] = useActionState(setupPayoutsAction, initialState);
	const isActive = user.payoutOnboardingStatus === 'ACTIVE' && user.razorpayLinkedAccountId;
	const defaultName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

	return (
		<div className="space-y-8">
			<div>
				<h2 className="font-headline text-2xl font-semibold tracking-tight text-foreground">
					Payouts
				</h2>
				<p className="mt-2 text-muted-foreground">
					Receive {100 - PLATFORM_FEE_PERCENT}% of each confirmed booking. Platform fee is{' '}
					{PLATFORM_FEE_PERCENT}%.
				</p>
			</div>

			<div className="border border-structural-border bg-card px-5 py-4 text-sm">
				<p className="font-semibold text-foreground">{statusLabel(user.payoutOnboardingStatus)}</p>
				{user.razorpayLinkedAccountId ? (
					<p className="mt-1 text-muted-foreground">
						Linked account: {user.razorpayLinkedAccountId}
					</p>
				) : (
					<p className="mt-1 text-muted-foreground">
						Bank details are sent to Razorpay only and are not stored in Book My Venue.
					</p>
				)}
			</div>

			{isActive ? null : (
				<form
					action={formAction}
					noValidate
					className="space-y-6 border border-structural-border bg-card p-6 sm:p-8"
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1.5 sm:col-span-2">
							<Label htmlFor="legalBusinessName">Business name</Label>
							<Input
								id="legalBusinessName"
								name="legalBusinessName"
								defaultValue={
									state.values?.legalBusinessName ?? (defaultName || 'Venue Owner')
								}
								required
							/>
							<FieldError message={state.fieldErrors?.legalBusinessName} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="contactName">Contact name</Label>
							<Input
								id="contactName"
								name="contactName"
								defaultValue={state.values?.contactName ?? defaultName}
								required
							/>
							<FieldError message={state.fieldErrors?.contactName} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="phone">Phone</Label>
							<Input
								id="phone"
								name="phone"
								type="tel"
								defaultValue={state.values?.phone ?? user.phone ?? ''}
								required
							/>
							<FieldError message={state.fieldErrors?.phone} />
						</div>
						<div className="space-y-1.5 sm:col-span-2">
							<Label htmlFor="street1">Street</Label>
							<Input
								id="street1"
								name="street1"
								defaultValue={state.values?.street1 ?? ''}
								required
							/>
							<FieldError message={state.fieldErrors?.street1} />
						</div>
						<div className="space-y-1.5 sm:col-span-2">
							<Label htmlFor="street2">Street line 2</Label>
							<Input
								id="street2"
								name="street2"
								defaultValue={state.values?.street2 ?? ''}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="city">City</Label>
							<Input id="city" name="city" defaultValue={state.values?.city ?? ''} required />
							<FieldError message={state.fieldErrors?.city} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="state">State</Label>
							<Input
								id="state"
								name="state"
								defaultValue={state.values?.state ?? ''}
								required
							/>
							<FieldError message={state.fieldErrors?.state} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="postalCode">Postal code</Label>
							<Input
								id="postalCode"
								name="postalCode"
								defaultValue={state.values?.postalCode ?? ''}
								required
							/>
							<FieldError message={state.fieldErrors?.postalCode} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="country">Country code</Label>
							<Input
								id="country"
								name="country"
								defaultValue={state.values?.country ?? 'IN'}
								required
							/>
							<FieldError message={state.fieldErrors?.country} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="pan">PAN</Label>
							<Input id="pan" name="pan" defaultValue={state.values?.pan ?? ''} required />
							<FieldError message={state.fieldErrors?.pan} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="bankBeneficiaryName">Beneficiary name</Label>
							<Input
								id="bankBeneficiaryName"
								name="bankBeneficiaryName"
								defaultValue={state.values?.bankBeneficiaryName ?? defaultName}
								required
							/>
							<FieldError message={state.fieldErrors?.bankBeneficiaryName} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="bankAccountNumber">Account number</Label>
							<Input
								id="bankAccountNumber"
								name="bankAccountNumber"
								defaultValue={state.values?.bankAccountNumber ?? ''}
								autoComplete="off"
								required
							/>
							<FieldError message={state.fieldErrors?.bankAccountNumber} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="bankIfsc">IFSC</Label>
							<Input
								id="bankIfsc"
								name="bankIfsc"
								defaultValue={state.values?.bankIfsc ?? ''}
								autoComplete="off"
								required
							/>
							<FieldError message={state.fieldErrors?.bankIfsc} />
						</div>
					</div>

					<FieldError message={state.error} />
					{state.success ? (
						<p className="text-sm text-foreground">Payouts are active.</p>
					) : null}

					<Button type="submit" disabled={pending}>
						{pending ? 'Setting up...' : 'Set up payouts'}
					</Button>
				</form>
			)}
		</div>
	);
}
