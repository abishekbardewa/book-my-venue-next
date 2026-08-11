export function formatInr(price: number) {
	return new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR',
		maximumFractionDigits: 0,
	}).format(price);
}

export function formatTagLabel(tag: string) {
	return tag.replace(/-/g, ' ');
}
