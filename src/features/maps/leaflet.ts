import L from 'leaflet';

let configured = false;

export function ensureLeafletDefaultIcon() {
	if (configured || typeof window === 'undefined') {
		return;
	}

	L.Icon.Default.mergeOptions({
		iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
		iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
		shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
	});
	configured = true;
}
