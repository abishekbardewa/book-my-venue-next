import Link from 'next/link';
import { Home } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { GoBackButton } from '@/components/common/GoBackButton';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFoundPage() {
	return (
		<div className="flex min-h-dvh flex-col bg-background">
			<header className="border-b border-structural-border bg-card">
				<div className="page-container-wide flex h-16 items-center">
					<Link href="/" aria-label="Book My Venue home">
						<BrandMark size="sm" />
					</Link>
				</div>
			</header>

			<main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
				<p className="font-headline text-[7rem] leading-none font-extrabold tracking-tighter text-secondary sm:text-[9rem]">
					404
				</p>
				<h1 className="font-headline mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Page not found
				</h1>
				<p className="mt-2 max-w-md text-muted-foreground sm:text-lg">
					The page you requested does not exist or may have moved. Return home to continue
					discovering venues.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
					<Link href="/" className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>
						<Home className="size-4" aria-hidden />
						Go to Home
					</Link>
					<GoBackButton className="label-caps inline-flex items-center justify-center gap-2 border border-transparent px-5 py-3 text-muted-foreground transition-colors hover:border-structural-border hover:text-foreground" />
				</div>
			</main>
		</div>
	);
}
