'use client';

import { useState } from 'react';
import { ProfileForm } from '@/features/users/components/ProfileForm';
import type { AppUser } from '@/features/users/db';
import { cn } from '@/lib/utils';

type ProfileSettingsProps = {
	user: AppUser;
};

export function ProfileSettings({ user }: ProfileSettingsProps) {
	const [view, setView] = useState<'account'>('account');

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
					Profile Settings
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">Keep your profile up to date</p>
			</div>

			<div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
				<aside className="lg:col-span-3">
					<nav aria-label="Profile sections" className="flex gap-2 lg:flex-col">
						<button
							type="button"
							onClick={() => setView('account')}
							className={cn(
								'rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
								view === 'account'
									? 'bg-secondary text-foreground'
									: 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
							)}
						>
							Account
						</button>
					</nav>
				</aside>

				<div className="mt-6 lg:col-span-9 lg:mt-0">
					{view === 'account' ? <ProfileForm user={user} /> : null}
				</div>
			</div>
		</div>
	);
}
