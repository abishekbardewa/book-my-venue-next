'use client';

import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { reverseGeocode } from '@/features/maps/geocode';
import {
	DEFAULT_CENTER,
	OSM_ATTRIBUTION,
	OSM_TILE_URL,
} from '@/features/maps/constants';
import { ensureLeafletDefaultIcon } from '@/features/maps/leaflet';
import type { LocationPickerValue } from '@/features/maps/components/LocationPicker';
import 'leaflet/dist/leaflet.css';

type DraggablePinMapProps = {
	lat?: string | null;
	lng?: string | null;
	onChange: (value: LocationPickerValue) => void;
	className?: string;
};

function toNumber(value: string | null | undefined) {
	if (!value?.trim()) {
		return null;
	}
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function MapCameraSync({ lat, lng }: { lat: number; lng: number }) {
	const map = useMap();

	useEffect(() => {
		map.setView([lat, lng], Math.max(map.getZoom(), 15));
	}, [map, lat, lng]);

	return null;
}

export default function LocationPickerMap({ lat, lng, onChange, className }: DraggablePinMapProps) {
	const initialLat = toNumber(lat);
	const initialLng = toNumber(lng);
	const [position, setPosition] = useState<[number, number]>(
		initialLat !== null && initialLng !== null
			? [initialLat, initialLng]
			: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]
	);

	useEffect(() => {
		ensureLeafletDefaultIcon();
	}, []);

	useEffect(() => {
		const nextLat = toNumber(lat);
		const nextLng = toNumber(lng);
		if (nextLat === null || nextLng === null) {
			return;
		}
		setPosition([nextLat, nextLng]);
	}, [lat, lng]);

	async function handleDragEnd(nextLat: number, nextLng: number) {
		setPosition([nextLat, nextLng]);
		const resolved = await reverseGeocode(nextLat, nextLng);
		onChange({
			lat: String(nextLat),
			lng: String(nextLng),
			address: resolved?.address || undefined,
			city: resolved?.matchedListingCity ?? resolved?.city ?? undefined,
			country: resolved?.country ?? undefined,
			pincode: resolved?.pincode ?? undefined,
		});
	}

	return (
		<div
			className={
				className ??
				'relative z-0 h-[280px] overflow-hidden rounded-none border border-structural-border sm:h-[320px]'
			}
		>
			<MapContainer
				center={position}
				zoom={initialLat !== null ? 15 : 5}
				scrollWheelZoom={false}
				className="h-full w-full"
			>
				<TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
				<MapCameraSync lat={position[0]} lng={position[1]} />
				<Marker
					position={position}
					draggable
					eventHandlers={{
						dragend: (event) => {
							const next = event.target.getLatLng();
							void handleDragEnd(next.lat, next.lng);
						},
					}}
				/>
			</MapContainer>
		</div>
	);
}
