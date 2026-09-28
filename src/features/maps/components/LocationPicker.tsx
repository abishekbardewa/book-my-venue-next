'use client';

import dynamic from 'next/dynamic';
import { useEffect, useId, useRef, useState } from 'react';
import { searchAddresses } from '@/features/maps/geocode';
import type { NominatimSearchHit } from '@/features/maps/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type LocationPickerValue = {
	lat: string;
	lng: string;
	address?: string;
	city?: string;
	country?: string;
	pincode?: string;
};

type LocationPickerProps = {
	lat?: string | null;
	lng?: string | null;
	onChange: (value: LocationPickerValue) => void;
	mapClassName?: string;
};

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
	ssr: false,
	loading: () => (
		<div
			className="h-[280px] overflow-hidden rounded-none border border-structural-border sm:h-[320px]"
			aria-hidden
		/>
	),
});

function PlaceSearch({ onPlace }: { onPlace: (value: LocationPickerValue) => void }) {
	const listId = useId();
	const [query, setQuery] = useState('');
	const [hits, setHits] = useState<NominatimSearchHit[]>([]);
	const [open, setOpen] = useState(false);
	const [pending, setPending] = useState(false);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		const trimmed = query.trim();
		if (trimmed.length < 2) {
			setHits([]);
			setPending(false);
			return;
		}

		setPending(true);
		debounceRef.current = setTimeout(() => {
			void searchAddresses(trimmed)
				.then((results) => {
					setHits(results);
					setOpen(true);
				})
				.finally(() => setPending(false));
		}, 400);

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [query]);

	function selectHit(hit: NominatimSearchHit) {
		setQuery(hit.label);
		setHits([]);
		setOpen(false);
		onPlace({
			lat: String(hit.lat),
			lng: String(hit.lng),
			address: hit.label || hit.address,
			city: hit.matchedListingCity ?? hit.city ?? undefined,
			country: hit.country ?? undefined,
			pincode: hit.pincode ?? undefined,
		});
	}

	return (
		<div className="relative z-[1100] space-y-1.5">
			<Label htmlFor="maps-place-search">Search address</Label>
			<div className="relative">
				<Input
					id="maps-place-search"
					type="text"
					value={query}
					placeholder="Start typing an address..."
					autoComplete="off"
					aria-autocomplete="list"
					aria-controls={listId}
					aria-expanded={open && hits.length > 0}
					onChange={(event) => setQuery(event.target.value)}
					onFocus={() => {
						if (hits.length > 0) setOpen(true);
					}}
					onBlur={() => {
						window.setTimeout(() => setOpen(false), 150);
					}}
				/>
				{open && hits.length > 0 ? (
					<ul
						id={listId}
						role="listbox"
						className="absolute top-full left-0 z-[1100] mt-1 max-h-56 w-full overflow-auto rounded-none border border-structural-border bg-background py-1 shadow-none"
					>
						{hits.map((hit) => (
							<li key={`${hit.lat}-${hit.lng}-${hit.label}`}>
								<button
									type="button"
									role="option"
									className="w-full px-3 py-2 text-left text-sm hover:bg-secondary"
									onMouseDown={(event) => event.preventDefault()}
									onClick={() => selectHit(hit)}
								>
									{hit.label}
								</button>
							</li>
						))}
					</ul>
				) : null}
			</div>
			{pending ? <p className="text-xs text-muted-foreground">Searching…</p> : null}
		</div>
	);
}

export function LocationPicker({ lat, lng, onChange, mapClassName }: LocationPickerProps) {
	return (
		<div className="space-y-3">
			<PlaceSearch onPlace={onChange} />
			<LocationPickerMap lat={lat} lng={lng} onChange={onChange} className={mapClassName} />
			<p className="text-xs text-muted-foreground">
				Search for an address or drag the pin. Coordinates are saved with the listing.
			</p>
		</div>
	);
}
