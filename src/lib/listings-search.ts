export function buildListingsHref(input: { city?: string; q?: string; tag?: string }): string {
	const params = new URLSearchParams();
	const city = input.city?.trim();
	const q = input.q?.trim();
	const tag = input.tag?.trim();

	if (city && city !== 'all') params.set('city', city);
	if (q) params.set('q', q);
	if (tag) params.set('tag', tag);

	const query = params.toString();
	return query ? `/listings?${query}` : '/listings';
}
