import Link from 'next/link';
import {
	archivePropertyAction,
	deletePropertyForeverAction,
	restorePropertyAction,
} from '@/features/properties/actions';
import type { PropertyRow } from '@/features/properties/db';
import { Button, buttonVariants } from '@/components/ui/button';

type OwnerPropertyListProps = {
	properties: PropertyRow[];
};

function statusLabel(property: PropertyRow) {
	if (property.isDeleted) {
		return 'Archived';
	}
	if (property.isDraft) {
		return 'Draft';
	}
	switch (property.listingStatus) {
		case 'PENDING_REVIEW':
			return 'Pending review';
		case 'APPROVED':
			return 'Approved';
		case 'REJECTED':
			return 'Rejected';
		default:
			return 'Submitted';
	}
}

export function OwnerPropertyList({ properties }: OwnerPropertyListProps) {
	const drafts = properties.filter((property) => !property.isDeleted && property.isDraft);
	const active = properties.filter((property) => !property.isDeleted && !property.isDraft);
	const archived = properties.filter((property) => property.isDeleted);

	return (
		<div className="space-y-10">
			<PropertySection title="Drafts" empty="No drafts yet." properties={drafts} />
			<PropertySection title="Submitted" empty="No submitted properties yet." properties={active} />
			<PropertySection title="Archived" empty="No archived properties." properties={archived} />
		</div>
	);
}

function PropertySection({
	title,
	empty,
	properties,
}: {
	title: string;
	empty: string;
	properties: PropertyRow[];
}) {
	return (
		<section className="space-y-3">
			<h2 className="text-lg font-semibold tracking-tight">{title}</h2>
			{properties.length === 0 ? (
				<p className="text-sm text-muted-foreground">{empty}</p>
			) : (
				<ul className="space-y-3">
					{properties.map((property) => (
						<li
							key={property.id}
							className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div>
								<p className="font-medium text-foreground">{property.propertyName}</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{property.city || 'City not set'} · {statusLabel(property)}
								</p>
								{property.listingStatus === 'REJECTED' && property.listingRejectionReason ? (
									<p className="mt-1 text-[11px] text-destructive">
										{property.listingRejectionReason}
									</p>
								) : null}
							</div>
							<div className="flex flex-wrap gap-2">
								{!property.isDeleted && (
									<Link
										href={`/owner/properties/${property.id}/edit`}
										className={buttonVariants({ variant: 'outline', size: 'sm' })}
									>
										{property.isDraft ? 'Continue' : 'Edit'}
									</Link>
								)}
								{!property.isDeleted ? (
									<form action={archivePropertyAction.bind(null, property.id)}>
										<Button type="submit" variant="outline" size="sm">
											Archive
										</Button>
									</form>
								) : (
									<>
										<form action={restorePropertyAction.bind(null, property.id)}>
											<Button type="submit" variant="outline" size="sm">
												Restore
											</Button>
										</form>
										<form action={deletePropertyForeverAction.bind(null, property.id)}>
											<Button type="submit" variant="destructive" size="sm">
												Delete forever
											</Button>
										</form>
									</>
								)}
							</div>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
