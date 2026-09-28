'use client';

import dynamic from 'next/dynamic';
import { DEFAULT_CENTER } from '@/features/maps/constants';

type VenueMapProps = {
	lat: string | number | null | undefined;
	lng: string | number | null | undefined;
	className?: string;
};

function toCoord(value: string | number | null | undefined) {
	if (value === null || value === undefined || value === '') {
		return null;
	}
	const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : null;
}

const VenueMapInner = dynamic(() => import('./VenueMapInner'), {
	ssr: false,
	loading: () => (
		<div
			className="h-[280px] overflow-hidden rounded-none border border-structural-border sm:h-[360px]"
			aria-hidden
		/>
	),
});

export function VenueMap({ lat, lng, className }: VenueMapProps) {
	const parsedLat = toCoord(lat);
	const parsedLng = toCoord(lng);

	if (parsedLat === null || parsedLng === null) {
		return null;
	}

	const shellClass =
		className ?? 'h-[280px] overflow-hidden rounded-none border border-structural-border sm:h-[360px]';

	return <VenueMapInner lat={parsedLat} lng={parsedLng} className={shellClass} />;
}

export { DEFAULT_CENTER };
