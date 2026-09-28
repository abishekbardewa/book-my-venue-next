'use client';

import { useState } from 'react';
import { ProfileForm } from '@/features/users/components/ProfileForm';
import { PayoutSettings } from '@/features/payments/components/PayoutSettings';
import type { PublicAppUser } from '@/features/users/db';
import { cn } from '@/lib/utils';

type ProfileTab = 'account' | 'payouts';

type ProfileSettingsProps = {
	user: PublicAppUser;
	hasPassword: boolean;
	initialTab?: ProfileTab;
	payoutsEnabled?: boolean;
};

export function ProfileSettings({
	user,
	hasPassword,
	initialTab = 'account',
	payoutsEnabled = false,
}: ProfileSettingsProps) {
	const showPayouts =
		payoutsEnabled && (user.role === 'OWNER' || user.role === 'PLATFORM_ADMIN');

	const [view, setView] = useState<ProfileTab>(
		initialTab === 'payouts' && showPayouts ? 'payouts' : 'account'
	);

	return (
		<div>
			<header className="border-b border-structural-border pb-6">
				<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Settings
				</h1>
				<p className="mt-2 text-muted-foreground sm:text-lg">
					Update your details, photo, and password.
				</p>
			</header>

			{showPayouts ? (
				<nav
					className="mt-8 flex flex-nowrap gap-2 overflow-x-auto pb-1"
					aria-label="Settings sections"
				>
					{(
						[
							{ id: 'account' as const, label: 'Account' },
							{ id: 'payouts' as const, label: 'Payouts' },
						] as const
					).map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setView(tab.id)}
							className={cn(
								'shrink-0 border px-4 py-2 text-xs font-semibold tracking-[0.1em] uppercase transition-colors',
								view === tab.id
									? 'border-foreground bg-foreground text-background'
									: 'border-structural-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground'
							)}
						>
							{tab.label}
						</button>
					))}
				</nav>
			) : null}

			<div className="mt-8">
				{view === 'account' ? (
					<ProfileForm user={user} hasPassword={hasPassword} />
				) : null}
				{view === 'payouts' && showPayouts ? <PayoutSettings user={user} /> : null}
			</div>
		</div>
	);
}
