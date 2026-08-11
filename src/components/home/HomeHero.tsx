import { VenueSearch } from '@/components/home/VenueSearch';

export function HomeHero() {
	return (
		<section className="relative">
			<div className="home-hero relative flex h-[320px] w-full items-end justify-center overflow-hidden sm:h-[350px]">
				<div
					aria-hidden
					className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_80%_10%,color-mix(in_oklab,var(--accent)_70%,transparent),transparent_50%),linear-gradient(165deg,var(--secondary)_0%,var(--background)_48%,color-mix(in_oklab,var(--primary)_10%,var(--background))_100%)]"
				/>
				<div
					aria-hidden
					className="absolute inset-0 opacity-40 [background-image:linear-gradient(color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
				/>
				<div className="page-container-wide relative z-10 w-full pb-10 sm:pb-12">
					<div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
						<h1 className="home-hero-copy text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
							Book My Venue
						</h1>
						<p className="home-hero-copy max-w-md text-sm text-muted-foreground sm:text-base">
							Find spaces for weddings, parties, and gatherings.
						</p>
						<VenueSearch className="w-full" />
					</div>
				</div>
			</div>
		</section>
	);
}
