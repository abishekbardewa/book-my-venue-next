import Link from 'next/link';

const legalLinks = [
	{ href: '/privacy-policy', label: 'Privacy Policy' },
	{ href: '/terms-of-service', label: 'Terms of Service' },
	{ href: '/cancel-refund-policy', label: 'Cancellation & Refund Policy' },
] as const;

export function SiteFooter() {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-auto border-t border-structural-border bg-card">
			<div className="page-container-wide flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
				<p className="font-sans">© {year} BookMyVenue. All Rights Reserved.</p>
				<nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Legal">
					{legalLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="label-caps text-muted-foreground transition-colors hover:text-foreground"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>
		</footer>
	);
}
