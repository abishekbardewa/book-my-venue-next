import Link from 'next/link';
import { cn } from '@/lib/utils';

export type PolicySection = {
	id: string;
	title: string;
	content: React.ReactNode;
};

type PolicyPageShellProps = {
	title: string;
	description: string;
	updatedLabel?: string;
	sections: PolicySection[];
	activeHref: '/privacy-policy' | '/terms-of-service' | '/cancel-refund-policy';
};

const POLICY_LINKS = [
	{ href: '/privacy-policy' as const, label: 'Privacy Policy' },
	{ href: '/terms-of-service' as const, label: 'Terms of Service' },
	{ href: '/cancel-refund-policy' as const, label: 'Cancellation & Refund' },
];

export function PolicyPageShell({
	title,
	description,
	updatedLabel = 'Last updated: August 2026',
	sections,
	activeHref,
}: PolicyPageShellProps) {
	return (
		<main className="page-container-wide py-10 sm:py-16">
			<header className="mb-10 max-w-3xl border-b border-structural-border pb-8">
				<p className="label-caps text-ink">{updatedLabel}</p>
				<h1 className="font-headline mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					{title}
				</h1>
				<p className="mt-2 text-muted-foreground sm:text-lg">{description}</p>
				<nav aria-label="Policies" className="mt-6 flex flex-wrap gap-2">
					{POLICY_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								'border px-3 py-2 text-[11px] font-semibold tracking-wider uppercase transition-colors',
								activeHref === link.href
									? 'border-primary bg-primary text-primary-foreground'
									: 'border-structural-border text-muted-foreground hover:border-primary hover:text-foreground'
							)}
						>
							{link.label}
						</Link>
					))}
				</nav>
			</header>

			<div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
				<aside className="lg:w-64 lg:shrink-0">
					<nav
						aria-label="On this page"
						className="sticky top-24 border border-structural-border bg-card p-5"
					>
						<h2 className="font-headline mb-4 border-b border-structural-border pb-3 text-lg font-semibold text-foreground">
							Contents
						</h2>
						<ul className="space-y-3">
							{sections.map((section, index) => (
								<li key={section.id}>
									<a
										href={`#${section.id}`}
										className="label-caps text-muted-foreground transition-colors hover:text-foreground"
									>
										{index + 1}. {section.title}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</aside>

				<div className="min-w-0 flex-1 space-y-10">
					{sections.map((section, index) => (
						<section key={section.id} id={section.id} className="scroll-mt-28">
							<h2 className="font-headline text-2xl font-semibold tracking-tight text-foreground">
								{index + 1}. {section.title}
							</h2>
							<div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:space-y-2">
								{section.content}
							</div>
						</section>
					))}
				</div>
			</div>
		</main>
	);
}
