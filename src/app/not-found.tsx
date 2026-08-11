import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function NotFoundPage() {
	return (
		<section className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
			<h1 className="text-xl font-semibold">Page not found</h1>
			<p className="text-sm text-muted-foreground">Check the URL and try again.</p>
			<Link href="/" className={buttonVariants()}>
				Home
			</Link>
		</section>
	);
}
