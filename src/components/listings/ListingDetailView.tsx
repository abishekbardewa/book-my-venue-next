import Link from 'next/link';
import {
	ArrowLeft,
	Check,
	Clock3,
	MapPin,
	Star,
	Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatTagLabel } from '@/lib/format';
import type { PublicListing } from '@/features/properties/types';
import { VenueMap } from '@/features/maps/components/VenueMap';
import { ListingGallery } from '@/components/listings/ListingGallery';
import { ListingReservationCard } from '@/components/listings/ListingReservationCard';
import { StarRating } from '@/features/reviews/components/StarRating';

type ListingDetailViewProps = {
	listing: PublicListing;
	currentUser: {
		id: string;
		role: 'CUSTOMER' | 'OWNER' | 'PLATFORM_ADMIN';
		firstName: string | null;
		lastName: string | null;
		email: string;
		phone: string | null;
		avatar: string | null;
	} | null;
};

export function ListingDetailView({ listing, currentUser }: ListingDetailViewProps) {
	const avgRating =
		listing.reviews.length > 0
			? listing.reviews.reduce((sum, review) => sum + review.rating, 0) /
				listing.reviews.length
			: null;
	const tagLabel = listing.tags.map(formatTagLabel).join(' | ');

	return (
		<div className="page-container-wide py-8 sm:py-10">
			<Link
				href="/"
				className="label-caps mb-6 inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-3.5" aria-hidden />
				Back to venues
			</Link>

			<div className="mb-6 md:mb-8">
				<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					{listing.propertyName}
				</h1>
				<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
					{avgRating !== null ? (
						<span className="inline-flex items-center gap-1">
							<Star className="size-4 fill-primary text-primary" aria-hidden />
							{avgRating.toFixed(1)} ({listing.reviews.length} reviews)
						</span>
					) : (
						<span>No reviews yet</span>
					)}
					{tagLabel ? (
						<>
							<span className="hidden text-structural-border sm:inline" aria-hidden>
								•
							</span>
							<span>{tagLabel}</span>
						</>
					) : null}
					<span className="hidden text-structural-border sm:inline" aria-hidden>
						•
					</span>
					<span className="inline-flex items-center gap-1">
						<MapPin className="size-4 shrink-0" aria-hidden />
						{listing.address}
					</span>
				</div>
			</div>

			<ListingGallery propertyName={listing.propertyName} images={listing.images} />

			<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
				<div className="flex flex-col gap-12 lg:col-span-8 lg:gap-16">
					<section>
						<h2 className="mb-6 border-b border-structural-border pb-3 font-headline text-2xl font-semibold tracking-tight text-foreground">
							About the Space
						</h2>
						<p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
							{listing.description}
						</p>
					</section>

					<section>
						<h2 className="mb-4 font-headline text-xl font-semibold tracking-tight text-foreground">
							Venue Essentials
						</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<div className="flex items-center gap-3 border border-structural-border bg-secondary/40 p-4">
								<Users className="size-6 shrink-0 text-primary" aria-hidden />
								<span className="text-xs font-semibold tracking-[0.1em] text-foreground uppercase">
									Up to {listing.capacity} guests
								</span>
							</div>
							<div className="flex items-center gap-3 border border-structural-border bg-secondary/40 p-4">
								<Clock3 className="size-6 shrink-0 text-primary" aria-hidden />
								<span className="text-xs font-semibold tracking-[0.1em] text-foreground uppercase">
									Access from {listing.checkInTime}
								</span>
							</div>
							<div className="flex items-center gap-3 border border-structural-border bg-secondary/40 p-4">
								<Clock3 className="size-6 shrink-0 text-primary" aria-hidden />
								<span className="text-xs font-semibold tracking-[0.1em] text-foreground uppercase">
									Access until {listing.checkOutTime}
								</span>
							</div>
						</div>
					</section>

					<section>
						<h2 className="mb-4 font-headline text-xl font-semibold tracking-tight text-foreground">
							Venue amenities
						</h2>
						{listing.amenities.length === 0 ? (
							<p className="text-sm text-muted-foreground">No amenities listed.</p>
						) : (
							<ul className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
								{listing.amenities.map((item) => (
									<li
										key={item}
										className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
									>
										<Check className="size-4 shrink-0 text-foreground" aria-hidden />
										{item}
									</li>
								))}
							</ul>
						)}
					</section>

					{listing.extraInfo ? (
						<section className="border-b border-structural-border pb-10">
							<h2 className="mb-4 font-headline text-xl font-semibold tracking-tight text-foreground">
								Extra Information
							</h2>
							<p className="leading-relaxed text-muted-foreground">{listing.extraInfo}</p>
						</section>
					) : null}

					<section className="flex flex-col items-center gap-6 border border-structural-border bg-secondary/30 p-6 sm:flex-row sm:items-start sm:p-8">
						<div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-card font-headline text-2xl font-semibold text-foreground">
							{listing.ownerAvatar ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={listing.ownerAvatar}
									alt=""
									className="size-full object-cover"
								/>
							) : (
								listing.ownerName.slice(0, 1)
							)}
						</div>
						<div className="flex-1 text-center sm:text-left">
							<h3 className="font-headline text-xl font-semibold text-foreground">
								Listed by {listing.ownerName}
							</h3>
							<p className="label-caps mt-1 text-ink tracking-widest">Venue owner</p>
							<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
								Reach out through your booking once reserved. Capacity up to{' '}
								{listing.capacity} guests at this venue.
							</p>
						</div>
					</section>

					<section>
						<h2 className="mb-4 font-headline text-xl font-semibold tracking-tight text-foreground">
							Location
						</h2>
						<p className="mb-4 text-sm text-muted-foreground">
							{listing.address}, {listing.city}, {listing.country}
						</p>
						{listing.lat && listing.lng ? (
							<div className="overflow-hidden border border-structural-border">
								<VenueMap lat={listing.lat} lng={listing.lng} />
							</div>
						) : (
							<div className="flex h-64 items-center justify-center border border-dashed border-structural-border bg-secondary text-sm text-muted-foreground">
								Map pin not set for this listing yet.
							</div>
						)}
					</section>

					<section>
						<div className="mb-6 flex items-center gap-4 border-b border-structural-border pb-3">
							<h2 className="font-headline text-2xl font-semibold tracking-tight text-foreground">
								Reviews
							</h2>
							{avgRating !== null ? (
								<div className="flex items-center gap-1.5">
									<Star className="size-5 fill-primary text-primary" aria-hidden />
									<span className="font-headline text-xl font-semibold text-foreground">
										{avgRating.toFixed(1)}
									</span>
								</div>
							) : null}
						</div>

						{listing.reviews.length === 0 ? (
							<p className="text-sm text-muted-foreground">No reviews yet.</p>
						) : (
							<ul className="grid grid-cols-1 gap-8 md:grid-cols-2">
								{listing.reviews.map((review) => (
									<li key={review.id} className="border-t border-structural-border pt-4">
										<div className="mb-3 flex items-center gap-3">
											{review.avatar ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={review.avatar}
													alt=""
													className="size-12 rounded-full border-2 border-primary object-cover"
												/>
											) : (
												<div className="flex size-12 items-center justify-center rounded-full border-2 border-primary bg-card text-sm font-semibold">
													{review.fullName.slice(0, 1)}
												</div>
											)}
											<div>
												<p className="text-sm font-semibold tracking-wide text-foreground uppercase">
													{review.fullName}
												</p>
												<p className="text-xs text-muted-foreground">
													{formatDistanceToNow(new Date(review.createdAt), {
														addSuffix: true,
													})}
												</p>
											</div>
										</div>
										<div className="mb-2 text-primary">
											<StarRating rating={review.rating} />
										</div>
										<p className="text-sm leading-relaxed text-muted-foreground">
											{review.review}
										</p>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>

				<div className="lg:col-span-4">
					<div className="lg:sticky lg:top-24">
						<ListingReservationCard listing={listing} currentUser={currentUser} />
					</div>
				</div>
			</div>
		</div>
	);
}
