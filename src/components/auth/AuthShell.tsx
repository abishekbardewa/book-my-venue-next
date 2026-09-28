import Link from 'next/link';
import { BrandMark } from '@/components/layout/BrandMark';
import { cn } from '@/lib/utils';

type AuthShellProps = {
	children: React.ReactNode;
	className?: string;
	split?: boolean;
	splitTitle?: string;
	splitDescription?: string;
};

const AUTH_PANEL_IMAGE = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80';

export function AuthShell({
	children,
	className,
	split = false,
	splitTitle = 'Curated Spaces.',
	splitDescription = 'Discover venues that redefine structural elegance.',
}: AuthShellProps) {
	if (split) {
		return (
			<div className="flex min-h-dvh w-full flex-col lg:flex-row">
				<section className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-8 lg:px-12 xl:px-24">
					<div className="mx-auto w-full max-w-md">
						<Link href="/" className="mb-10 inline-block" aria-label="Book My Venue home">
							<BrandMark size="sm" />
						</Link>
						{children}
					</div>
				</section>
				<section className="relative hidden min-h-[40vh] overflow-hidden lg:block lg:min-h-dvh lg:flex-1">
					{/* eslint-disable-next-line @next/next/no-img-element -- decorative panel */}
					<img src={AUTH_PANEL_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
					<div className="absolute inset-0 bg-ink/35" />
					<div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card/30 to-transparent backdrop-blur-[2px]" />
					<div className="absolute right-12 bottom-12 left-12 border border-white/25 bg-white/10 p-8 backdrop-blur-md">
						<h2 className="font-headline text-4xl font-bold tracking-tight text-white">{splitTitle}</h2>
						<p className="mt-2 text-lg text-white/80">{splitDescription}</p>
					</div>
				</section>
			</div>
		);
	}

	return (
		<div className="flex min-h-dvh flex-col">
			<header className="border-b border-structural-border bg-card">
				<div className="page-container-wide flex min-h-14 items-center py-3">
					<Link href="/" aria-label="Book My Venue home">
						<BrandMark size="sm" />
					</Link>
				</div>
			</header>
			<main className={cn('flex flex-1 items-center justify-center px-4 py-12 sm:px-8', className)}>{children}</main>
		</div>
	);
}
