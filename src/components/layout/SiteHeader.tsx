import Link from 'next/link';
import { Bell, Settings } from 'lucide-react';
import { signOut } from '@/auth';
import { BrandMark } from '@/components/layout/BrandMark';
import { SiteHeaderNav } from '@/components/layout/SiteHeaderNav';
import { SiteHeaderMobileNav } from '@/components/layout/SiteHeaderMobileNav';
import { UserAccountMenu } from '@/components/layout/UserAccountMenu';
import { buttonVariants } from '@/components/ui/button';
import { countUnreadNotifications } from '@/features/notifications/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { cn } from '@/lib/utils';

async function signOutAction() {
	'use server';
	await signOut({ redirectTo: '/' });
}

export async function SiteHeader() {
	const { user, userId } = await getCurrentUser();
	const unreadCount =
		user && userId ? await countUnreadNotifications(userId) : 0;
	const hasUnread = unreadCount > 0;

	return (
		<header className="relative sticky top-0 z-50 border-b border-structural-border bg-card">
			<div className="page-container-wide grid h-20 grid-cols-[auto_1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
				<Link href="/" aria-label="Book My Venue home" className="shrink-0 justify-self-start">
					<BrandMark size="sm" />
				</Link>

				<div className="justify-self-center">
					<SiteHeaderNav role={user?.role ?? null} />
				</div>

				<div className="flex shrink-0 items-center justify-self-end gap-2 sm:gap-3">
					{user ? (
						<>
							<Link
								href="/notifications"
								aria-label={
									hasUnread
										? `Notifications, ${unreadCount} unread`
										: 'Notifications'
								}
								className="relative hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
							>
								<Bell className="size-5" aria-hidden />
								{hasUnread ? (
									<span
										className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500"
										aria-hidden
									/>
								) : null}
							</Link>
							<Link
								href="/settings"
								aria-label="Settings"
								className="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
							>
								<Settings className="size-5" aria-hidden />
							</Link>
							<UserAccountMenu
								email={user.email}
								firstName={user.firstName}
								lastName={user.lastName}
								avatar={user.avatar}
								role={user.role}
								signOutAction={signOutAction}
							/>
						</>
					) : (
						<div className="flex items-center gap-2 sm:gap-3">
							<Link
								href="/sign-in"
								className={cn(
									buttonVariants({ variant: 'ghost', size: 'sm' }),
									'font-semibold tracking-[0.1em] uppercase'
								)}
							>
								Sign in
							</Link>
							<Link href="/sign-up" className={cn(buttonVariants({ size: 'sm' }))}>
								Sign up
							</Link>
						</div>
					)}
					<SiteHeaderMobileNav
						role={user?.role ?? null}
						hasUnreadNotifications={hasUnread}
					/>
				</div>
			</div>
		</header>
	);
}
