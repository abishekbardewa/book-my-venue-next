import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { BrandMark } from '@/components/layout/BrandMark';
import { Button, buttonVariants } from '@/components/ui/button';

export async function SiteHeader() {
	const session = await auth();

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-sm backdrop-blur-sm">
			<div className="site-header-inner">
				<Link href="/" aria-label="Book My Venue home">
					<BrandMark />
				</Link>
				<div className="flex items-center gap-2 sm:gap-3">
					{session?.user ? (
						<form
							action={async () => {
								'use server';
								await signOut({ redirectTo: '/' });
							}}
						>
							<Button type="submit" variant="outline" size="sm">
								Sign out
							</Button>
						</form>
					) : (
						<>
							<Link
								href="/sign-in"
								className={buttonVariants({ variant: 'outline', size: 'sm' })}
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
