'use client';

import { useState } from 'react';
import { LocateFixed } from 'lucide-react';
import { resolveNearbyListingCity } from '@/features/maps/resolveNearbyListingCity';
import { Button } from '@/components/ui/button';

type UseMyLocationButtonProps = {
	onCityResolved: (city: string) => void;
};

export function UseMyLocationButton({ onCityResolved }: UseMyLocationButtonProps) {
	const [pending, setPending] = useState(false);

	async function handleClick() {
		setPending(true);
		try {
			const city = await resolveNearbyListingCity();
			if (city) onCityResolved(city);
		} finally {
			setPending(false);
		}
	}

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			onClick={handleClick}
			disabled={pending}
			className="gap-1.5"
		>
			<LocateFixed className="size-4" aria-hidden />
			{pending ? 'Locating...' : 'Use my location'}
		</Button>
	);
}
