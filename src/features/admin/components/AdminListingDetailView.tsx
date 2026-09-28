import Link from 'next/link';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { AdminReviewPanel } from '@/features/admin/components/AdminReviewPanel';
import { VenueMap } from '@/features/maps/components/VenueMap';
import type { AdminListingDetail } from '@/features/properties/types';
import { formatInr, formatTagLabel } from '@/lib/format';
import { ListingGallery } from '@/components/listings/ListingGallery';
import { cn } from '@/lib/utils';

type AdminListingDetailViewProps = {
	listing: AdminListingDetail;
};

function statusBadge(status: AdminListingDetail['listingStatus']) {
	switch (status) {
		case 'PENDING_REVIEW':
			return {
				label: 'Pending Review',
				className: 'border-primary/30 bg-secondary text-foreground',
			};
		case 'APPROVED':
			return {
				label: 'Approved',
				className: 'border-emerald-600/30 bg-emerald-600/10 text-emerald-800',
			};
		case 'REJECTED':
			return {
				label: 'Rejected',
				className: 'border-destructive/30 bg-destructive/10 text-destructive',
			};
		default:
			return {
				label: 'Unknown',
				className: 'border-structural-border bg-card text-muted-foreground',
			};
	}
}

export function AdminListingDetailView({ listing }: AdminListingDetailViewProps) {
	const status = statusBadge(listing.listingStatus);

	return (
		<div className="page-container-wide py-10 sm:py-14">
			<Link
				href="/admin"
				className="label-caps mb-8 inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-3.5" aria-hidden />
				Back to Listings
			</Link>

			<div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
				<div className="flex min-w-0 flex-1 flex-col gap-8">
					<div className="flex flex-col gap-3 lg:hidden">
						<span
							className={cn(
								'inline-flex self-start border px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase',
								status.className
							)}
						>
							{status.label}
						</span>
						<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
							{listing.propertyName}
						</h1>
						<p className="text-muted-foreground">
							{listing.tags.map(formatTagLabel).join(' · ') || 'Venue'}
						</p>
					</div>

					<ListingGallery propertyName={listing.propertyName} images={listing.images} />

					<div className="hidden flex-col gap-2 lg:flex">
						<h1 className="font-headline text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
							{listing.propertyName}
						</h1>
						<p className="flex flex-wrap items-center gap-2 text-lg text-muted-foreground">
							{listing.tags.length > 0 ? (
								listing.tags.map((tag, index) => (
									<span key={tag} className="inline-flex items-center gap-2">
										{index > 0 ? (
											<span className="size-1 bg-structural-border" aria-hidden />
										) : null}
										{formatTagLabel(tag)}
									</span>
								))
							) : (
								<span>Venue listing</span>
							)}
							<span className="size-1 bg-structural-border" aria-hidden />
							<span className="inline-flex items-center gap-1">
								<MapPin className="size-4" aria-hidden />
								{listing.city}, {listing.country}
							</span>
						</p>
					</div>

					<div className="flex flex-wrap gap-6 border-y border-structural-border py-5">
						<div className="flex items-center gap-3 pr-6 border-r border-structural-border">
							<Users className="size-5 text-primary" aria-hidden />
							<div>
								<p className="label-caps text-muted-foreground">Capacity</p>
								<p className="text-foreground">Up to {listing.capacity} guests</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div>
								<p className="label-caps text-muted-foreground">Pricing</p>
								<p className="text-foreground">{formatInr(listing.price)} / day</p>
							</div>
						</div>
					</div>

					<section className="space-y-3">
						<h2 className="font-headline text-xl font-semibold text-foreground">Description</h2>
						<p className="max-w-3xl leading-relaxed text-muted-foreground">
							{listing.description}
						</p>
					</section>

					<div className="grid gap-8 border-t border-structural-border pt-8 md:grid-cols-2">
						<section className="space-y-4">
							<h3 className="label-caps text-foreground">Core Amenities</h3>
							{listing.amenities.length > 0 ? (
								<ul className="space-y-2">
									{listing.amenities.map((item) => (
										<li key={item} className="flex items-center gap-2 text-muted-foreground">
											<span className="size-1.5 bg-primary" aria-hidden />
											{item}
										</li>
									))}
								</ul>
							) : (
								<p className="text-sm text-muted-foreground">No amenities listed.</p>
							)}
						</section>
						<section className="space-y-4">
							<h3 className="label-caps text-foreground">Policies & Suitability</h3>
							<div className="flex flex-wrap gap-2">
								{listing.tags.map((tag) => (
									<span
										key={tag}
										className="border border-structural-border bg-secondary/40 px-2 py-1 text-[10px] font-semibold tracking-wider uppercase"
									>
										{formatTagLabel(tag)}
									</span>
								))}
							</div>
							{listing.extraInfo ? (
								<p className="text-sm leading-relaxed text-muted-foreground">
									{listing.extraInfo}
								</p>
							) : (
								<p className="text-sm text-muted-foreground">No extra policies provided.</p>
							)}
						</section>
					</div>

					<section className="space-y-3 border-t border-structural-border pt-8">
						<h2 className="font-headline text-xl font-semibold text-foreground">Location</h2>
						<p className="text-muted-foreground">{listing.address}</p>
						<p className="text-sm text-muted-foreground">
							{listing.city}, {listing.country}
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
				</div>

				<aside className="w-full shrink-0 lg:w-[350px]">
					<div className="lg:sticky lg:top-24">
						<AdminReviewPanel listing={listing} />
					</div>
				</aside>
			</div>
		</div>
	);
}
