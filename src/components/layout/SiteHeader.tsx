import Link from 'next/link';
import { signOut } from '@/auth';
import { BrandMark } from '@/components/layout/BrandMark';
import { UserAccountMenu } from '@/components/layout/UserAccountMenu';
import { buttonVariants } from '@/components/ui/button';
import { getCurrentUser } from '@/features/users/getCurrentUser';

async function signOutAction() {
	'use server';
	await signOut({ redirectTo: '/' });
}

export async function SiteHeader() {
	const { user } = await getCurrentUser();

	return (
		<header className="sticky top-0 z-50 bg-secondary/90 backdrop-blur-md">
			<div className="site-header-inner">
				<Link href="/" aria-label="Book My Venue home">
					<BrandMark size="sm" />
				</Link>
				<div className="flex items-center gap-2 sm:gap-3">
					{user ? (
						<UserAccountMenu
							email={user.email}
							firstName={user.firstName}
							lastName={user.lastName}
							avatar={user.avatar}
							role={user.role}
							signOutAction={signOutAction}
						/>
					) : (
						<>
							<Link
								href="/sign-in"
								className={buttonVariants({ variant: 'ghost', size: 'sm' })}
							>
								Sign in
							</Link>
							<Link href="/sign-up" className={buttonVariants({ size: 'sm' })}>
								Sign up
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
