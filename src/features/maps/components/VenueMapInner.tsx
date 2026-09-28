'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { OSM_ATTRIBUTION, OSM_TILE_URL } from '@/features/maps/constants';
import { ensureLeafletDefaultIcon } from '@/features/maps/leaflet';
import 'leaflet/dist/leaflet.css';

type VenueMapInnerProps = {
	lat: number;
	lng: number;
	className: string;
};

export default function VenueMapInner({ lat, lng, className }: VenueMapInnerProps) {
	useEffect(() => {
		ensureLeafletDefaultIcon();
	}, []);

	const position: [number, number] = [lat, lng];

	return (
		<div className={className}>
			<MapContainer
				center={position}
				zoom={15}
				scrollWheelZoom={false}
				className="h-full w-full"
			>
				<TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
				<Marker position={position} />
			</MapContainer>
		</div>
	);
}
