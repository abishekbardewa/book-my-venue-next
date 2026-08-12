import Link from 'next/link';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { AdminReviewPanel } from '@/features/admin/components/AdminReviewPanel';
import type { AdminListingDetail } from '@/features/properties/types';
import { formatTagLabel } from '@/lib/format';
import { ListingGallery } from '@/components/listings/ListingGallery';

type AdminListingDetailViewProps = {
	listing: AdminListingDetail;
};

export function AdminListingDetailView({ listing }: AdminListingDetailViewProps) {
	return (
		<div className="page-container space-y-8 py-8">
			<div className="space-y-3">
				<Link
					href="/admin"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="size-4" aria-hidden />
					Back to moderation
				</Link>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
						{listing.propertyName}
					</h1>
					<p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
						<MapPin className="size-4 shrink-0" aria-hidden />
						{listing.city}, {listing.country}
					</p>
				</div>
			</div>

			<ListingGallery propertyName={listing.propertyName} images={listing.images} />

			<div className="grid gap-10 md:grid-cols-7 md:gap-16">
				<div className="space-y-8 md:col-span-4">
					<ul className="flex flex-wrap gap-2">
						{listing.tags.map((tag) => (
							<li
								key={tag}
								className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground capitalize"
							>
								{formatTagLabel(tag)}
							</li>
						))}
					</ul>

					<div className="flex items-center justify-between gap-4 border-b border-border pb-6">
						<div>
							<p className="font-medium text-foreground">Owned By {listing.ownerName}</p>
							<p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
								<Users className="size-4" aria-hidden />
								{listing.capacity} Capacity
							</p>
						</div>
						<div className="flex size-12 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
							{listing.ownerName.slice(0, 1)}
						</div>
					</div>

					<section className="space-y-2">
						<h2 className="text-xl font-medium text-foreground">Description</h2>
						<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
							{listing.description}
						</p>
					</section>

					<section className="space-y-2">
						<h2 className="text-xl font-medium text-foreground">Address</h2>
						<p className="text-sm text-muted-foreground sm:text-base">{listing.address}</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-medium text-foreground">What this place offers</h2>
						<ul className="grid gap-2 sm:grid-cols-2">
							{listing.amenities.map((item) => (
								<li key={item} className="flex items-center gap-2 text-sm text-foreground">
									<span className="size-1.5 rounded-full bg-primary" aria-hidden />
									{item}
								</li>
							))}
						</ul>
					</section>

					<section className="space-y-2">
						<h2 className="text-xl font-medium text-foreground">Extra Information</h2>
						<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
							{listing.extraInfo}
						</p>
					</section>
				</div>

				<div className="order-first md:order-last md:col-span-3">
					<div className="md:sticky md:top-24">
						<AdminReviewPanel listing={listing} />
					</div>
				</div>
			</div>
		</div>
	);
}
