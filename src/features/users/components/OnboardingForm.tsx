'use client';

import { useActionState, useState } from 'react';
import { Building2, UserRound } from 'lucide-react';
import {
	completeOnboardingAction,
	type OnboardingActionState,
} from '@/features/users/actions';
import type { AppUser } from '@/features/users/db';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type OnboardingFormProps = {
	user: AppUser;
};

const initialState: OnboardingActionState = {};

export function OnboardingForm({ user }: OnboardingFormProps) {
	const [state, formAction, pending] = useActionState(completeOnboardingAction, initialState);
	const [role, setRole] = useState<'CUSTOMER' | 'OWNER' | ''>(
		state.values?.role === 'CUSTOMER' || state.values?.role === 'OWNER' ? state.values.role : ''
	);

	return (
		<form
			key={JSON.stringify(state.values ?? {})}
			action={formAction}
			noValidate
			className="mx-auto w-full max-w-lg space-y-6"
		>
			<input type="hidden" name="role" value={role} />

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<button
					type="button"
					onClick={() => setRole('CUSTOMER')}
					className={cn(
						'flex h-24 flex-col items-center justify-center gap-2 rounded-xl border transition-colors',
						role === 'CUSTOMER'
							? 'border-primary bg-primary text-primary-foreground'
							: 'border-border bg-card text-foreground hover:bg-secondary'
					)}
				>
					<UserRound className="size-7" aria-hidden />
					<span className="text-sm font-medium">User</span>
				</button>
				<button
					type="button"
					onClick={() => setRole('OWNER')}
					className={cn(
						'flex h-24 flex-col items-center justify-center gap-2 rounded-xl border transition-colors',
						role === 'OWNER'
							? 'border-primary bg-primary text-primary-foreground'
							: 'border-border bg-card text-foreground hover:bg-secondary'
					)}
				>
					<Building2 className="size-7" aria-hidden />
					<span className="text-sm font-medium">Owner</span>
				</button>
			</div>
			<FieldError message={state.fieldErrors?.role} />

			<div className="space-y-1.5">
				<Label htmlFor="email">Email</Label>
				<Input id="email" name="email" type="email" value={user.email} disabled readOnly />
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="firstName">First name</Label>
					<Input
						id="firstName"
						name="firstName"
						defaultValue={state.values?.firstName ?? user.firstName ?? ''}
						autoComplete="given-name"
					/>
					<FieldError message={state.fieldErrors?.firstName} />
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="lastName">Last name</Label>
					<Input
						id="lastName"
						name="lastName"
						defaultValue={state.values?.lastName ?? user.lastName ?? ''}
						autoComplete="family-name"
					/>
					<FieldError message={state.fieldErrors?.lastName} />
				</div>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="phone">Phone</Label>
				<div className="flex items-center gap-2">
					<span className="inline-flex h-9 items-center rounded-full border border-input bg-secondary px-3 text-sm text-muted-foreground">
						+91
					</span>
					<Input
						id="phone"
						name="phone"
						type="tel"
						inputMode="numeric"
						placeholder="Optional"
						defaultValue={state.values?.phone ?? user.phone ?? ''}
						autoComplete="tel-national"
						className="flex-1"
					/>
				</div>
				<FieldError message={state.fieldErrors?.phone} />
			</div>

			<FieldError message={state.error} />

			<Button type="submit" className="w-full" size="lg" disabled={pending}>
				{pending ? 'Saving...' : 'Continue'}
			</Button>
		</form>
	);
}
