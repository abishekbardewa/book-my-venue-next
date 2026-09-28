'use client';

import { useActionState, useState } from 'react';
import { Building2, UserRound } from 'lucide-react';
import { authFieldClassName } from '@/components/auth/AuthDivider';
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
			className="w-full max-w-3xl border border-structural-border bg-card p-6 sm:p-8 lg:p-12"
		>
			<input type="hidden" name="role" value={role} />

			<header className="mb-10 text-center">
				<p className="label-caps mb-3 text-ink tracking-[0.1em]">Almost there</p>
				<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Complete Your Profile
				</h1>
				<p className="mx-auto mt-2 max-w-lg text-muted-foreground sm:text-lg">
					Add a few details so we can set up your account.
				</p>
			</header>

			<section className="space-y-4">
				<h2 className="font-headline border-b border-structural-border pb-2 text-xl font-semibold tracking-tight text-foreground">
					I am a…
				</h2>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<button
						type="button"
						onClick={() => setRole('CUSTOMER')}
						className={cn(
							'flex h-32 flex-col items-center justify-center gap-3 border transition-colors',
							role === 'CUSTOMER'
								? 'border-primary bg-secondary text-foreground'
								: 'border-structural-border bg-background text-foreground hover:border-primary/50'
						)}
					>
						<UserRound
							className={cn(
								'size-8',
								role === 'CUSTOMER' ? 'text-ink' : 'text-muted-foreground'
							)}
							aria-hidden
						/>
						<span className="text-xs font-semibold tracking-[0.1em] uppercase">User</span>
					</button>
					<button
						type="button"
						onClick={() => setRole('OWNER')}
						className={cn(
							'flex h-32 flex-col items-center justify-center gap-3 border transition-colors',
							role === 'OWNER'
								? 'border-primary bg-secondary text-foreground'
								: 'border-structural-border bg-background text-foreground hover:border-primary/50'
						)}
					>
						<Building2
							className={cn(
								'size-8',
								role === 'OWNER' ? 'text-ink' : 'text-muted-foreground'
							)}
							aria-hidden
						/>
						<span className="text-xs font-semibold tracking-[0.1em] uppercase">Owner</span>
					</button>
				</div>
				<FieldError message={state.fieldErrors?.role} />
			</section>

			<section className="mt-10 space-y-6">
				<h2 className="font-headline border-b border-structural-border pb-2 text-xl font-semibold tracking-tight text-foreground">
					Personal Details
				</h2>

				<div className="space-y-2">
					<Label htmlFor="email">Email Address</Label>
					<Input
						id="email"
						name="email"
						type="email"
						value={user.email}
						disabled
						readOnly
						className={authFieldClassName}
					/>
				</div>

				<div className="grid gap-6 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="firstName">First Name</Label>
						<Input
							id="firstName"
							name="firstName"
							placeholder="Jane"
							defaultValue={state.values?.firstName ?? user.firstName ?? ''}
							autoComplete="given-name"
							className={authFieldClassName}
						/>
						<FieldError message={state.fieldErrors?.firstName} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="lastName">Last Name</Label>
						<Input
							id="lastName"
							name="lastName"
							placeholder="Doe"
							defaultValue={state.values?.lastName ?? user.lastName ?? ''}
							autoComplete="family-name"
							className={authFieldClassName}
						/>
						<FieldError message={state.fieldErrors?.lastName} />
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="phone">Phone Number</Label>
					<div className="flex items-stretch border border-structural-border bg-secondary/40 focus-within:border-primary">
						<span className="inline-flex items-center border-r border-structural-border px-3 text-sm text-muted-foreground">
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
							className="h-11 flex-1 rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
						/>
					</div>
					<FieldError message={state.fieldErrors?.phone} />
				</div>
			</section>

			<FieldError message={state.error} className="mt-6" />

			<div className="mt-10 flex justify-end border-t border-structural-border pt-8">
				<Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:min-w-48">
					{pending ? 'Saving...' : 'Save and Continue'}
				</Button>
			</div>
		</form>
	);
}
