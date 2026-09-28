'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ArrowRight,
	Building2,
	CalendarCheck2,
	ShieldCheck,
} from 'lucide-react';
import type { PublicListing } from '@/features/properties/types';
import { EmptyState } from '@/components/common/EmptyState';
import { ListingCard } from '@/components/home/ListingCard';
import { ListingSearch } from '@/components/home/ListingSearch';
import { buttonVariants } from '@/components/ui/button';
import { buildListingsHref } from '@/lib/listings-search';
import { cn } from '@/lib/utils';

const HERO_IMAGE =
	'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=80';

const CTA_IMAGE =
	'https://images.unsplash.com/photo-1519167758481-83f29da8ac14?auto=format&fit=crop&w=2400&q=80';

const FEATURED_COUNT = 3;

const OCCASIONS = [
	{
		tag: 'wedding',
		label: 'Weddings',
		description: 'Halls and estates made for ceremonies and receptions.',
		image:
			'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
		featured: true,
	},
	{
		tag: 'corporate-party',
		label: 'Corporate',
		description: 'Spaces for offsites, launches, and team gatherings.',
		image:
			'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
		featured: false,
	},
	{
		tag: 'banquet-halls',
		label: 'Banquet halls',
		description: 'Classic banquet venues ready for large celebrations.',
		image:
			'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
		featured: false,
	},
] as const;

const REASONS = [
	{
		icon: Building2,
		title: 'Curated venues',
		description:
			'Browse approved listings across cities — halls, farmhouses, and event-ready spaces.',
	},
	{
		icon: CalendarCheck2,
		title: 'Clear booking flow',
		description:
			'Pick dates, pay securely, and wait for owner confirmation before the event is locked in.',
	},
	{
		icon: ShieldCheck,
		title: 'Owner-approved bookings',
		description:
			'Every paid request goes to the venue owner, so availability is confirmed before you celebrate.',
	},
] as const;

type HomeBrowseProps = {
	listings: PublicListing[];
};

export function HomeBrowse({ listings }: HomeBrowseProps) {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [city, setCity] = useState('all');
	const [category, setCategory] = useState('');

	const featured = useMemo(() => listings.slice(0, FEATURED_COUNT), [listings]);

	return (
		<>
			<section className="home-hero relative flex min-h-[720px] w-full items-center justify-center overflow-hidden px-4 py-20 sm:min-h-[819px] sm:px-6 lg:px-12">
				<div className="absolute inset-0 z-0">
					{/* eslint-disable-next-line @next/next/no-img-element -- decorative hero */}
					<img
						src={HERO_IMAGE}
						alt=""
						className="h-full w-full object-cover opacity-35"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background" />
				</div>

				<div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 text-center sm:gap-10">
					<div className="home-hero-copy max-w-4xl space-y-5">
						<h1 className="font-headline text-4xl font-extrabold tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[64px] lg:leading-[1.1]">
							Discover Spaces of{' '}
							<span className="text-primary italic">Distinction</span>
						</h1>
						<p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
							Curated venues for extraordinary events. From architectural marvels to
							secluded estates, find the perfect canvas for your next gathering.
						</p>
					</div>

					<div className="home-search w-full max-w-4xl">
						<ListingSearch
							className="w-full"
							listings={listings}
							city={city}
							category={category}
							searchQuery={searchQuery}
							variant="hero"
							commitMode="submit"
							showCategory
							onCityChange={(nextCity) => {
								setCity(nextCity);
								setSearchQuery('');
							}}
							onCategoryChange={setCategory}
							onSearchCommit={(query) => {
								setSearchQuery(query);
								router.push(
									buildListingsHref({
										city,
										q: query,
										tag: category,
									})
								);
							}}
						/>
					</div>
				</div>
			</section>

			<section className="page-container-wide border-b border-structural-border py-14 sm:py-20">
				<div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="label-caps text-ink">Featured</p>
						<h2 className="font-headline mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
							Featured venues
						</h2>
						<p className="mt-2 max-w-xl text-muted-foreground">
							A short list of approved spaces to start exploring.
						</p>
					</div>
					<Link
						href="/listings"
						className={cn(
							buttonVariants({ variant: 'outline' }),
							'hidden w-fit shrink-0 sm:inline-flex'
						)}
					>
						View all
						<ArrowRight className="size-4" aria-hidden />
					</Link>
				</div>

				{featured.length === 0 ? (
					<EmptyState
						icon={Building2}
						title="No venues yet"
						description="Approved listings will show up here once owners publish them."
						className="py-16"
					/>
				) : (
					<ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
						{featured.map((listing, index) => (
							<li key={listing.id}>
								<ListingCard listing={listing} index={index} />
							</li>
						))}
					</ul>
				)}

				<div className="mt-8 flex justify-center sm:hidden">
					<Link href="/listings" className={cn(buttonVariants({ variant: 'outline' }))}>
						View all
						<ArrowRight className="size-4" aria-hidden />
					</Link>
				</div>
			</section>

			<section className="page-container-wide py-14 sm:py-20">
				<div className="mb-10 max-w-2xl">
					<p className="label-caps text-ink">Occasions</p>
					<h2 className="font-headline mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
						Browse by occasion
					</h2>
					<p className="mt-2 text-muted-foreground">
						Jump straight into venues suited to how you celebrate.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 md:h-[560px]">
					{OCCASIONS.map((occasion) => (
						<Link
							key={occasion.tag}
							href={buildListingsHref({ tag: occasion.tag })}
							className={cn(
								'group relative block min-h-[240px] overflow-hidden border border-structural-border',
								occasion.featured && 'md:col-span-2 md:row-span-2 md:min-h-0'
							)}
						>
							<Image
								src={occasion.image}
								alt=""
								fill
								sizes={
									occasion.featured
										? '(max-width: 768px) 100vw, 66vw'
										: '(max-width: 768px) 100vw, 33vw'
								}
								className="object-cover transition-transform duration-700 group-hover:scale-105"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/35 to-transparent" />
							<div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
								<span className="label-caps mb-2 inline-block border border-structural-border bg-card/90 px-2 py-1 text-[10px] text-ink">
									Category
								</span>
								<h3 className="font-headline text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
									{occasion.label}
								</h3>
								<p className="mt-1 max-w-md text-sm text-muted-foreground">
									{occasion.description}
								</p>
							</div>
						</Link>
					))}
				</div>
			</section>

			<section className="border-y border-structural-border bg-secondary/30">
				<div className="page-container-wide py-14 sm:py-20">
					<div className="mx-auto max-w-2xl text-center">
						<p className="label-caps text-ink">Why Book My Venue</p>
						<h2 className="font-headline mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
							Built for event booking
						</h2>
					</div>
					<ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
						{REASONS.map((reason) => (
							<li key={reason.title} className="text-center md:text-left">
								<span className="inline-flex size-12 items-center justify-center border border-structural-border bg-card text-primary">
									<reason.icon className="size-5" aria-hidden />
								</span>
								<h3 className="font-headline mt-5 text-xl font-semibold text-foreground">
									{reason.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{reason.description}
								</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className="relative overflow-hidden py-20 sm:py-28">
				<div className="absolute inset-0">
					<Image
						src={CTA_IMAGE}
						alt=""
						fill
						sizes="100vw"
						className="object-cover opacity-30"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/75 to-background" />
				</div>
				<div className="page-container-wide relative z-10 flex flex-col items-center text-center">
					<p className="label-caps text-ink">Next step</p>
					<h2 className="font-headline mt-3 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
						Find a venue for your next gathering
					</h2>
					<p className="mt-4 max-w-xl text-muted-foreground sm:text-lg">
						Filter by city and occasion, or list your own space for customers to book.
					</p>
					<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
						<Link href="/listings" className={cn(buttonVariants({ size: 'lg' }))}>
							Browse venues
							<ArrowRight className="size-4" aria-hidden />
						</Link>
						<Link
							href="/owner"
							className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
						>
							List a venue
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
