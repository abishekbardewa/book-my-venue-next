export type PaginationItem = number | 'ellipsis';

export function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
	if (totalPages <= 0) return [];
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const current = Math.min(Math.max(currentPage, 1), totalPages);
	const siblings = 1;
	const left = Math.max(current - siblings, 1);
	const right = Math.min(current + siblings, totalPages);
	const showLeftEllipsis = left > 2;
	const showRightEllipsis = right < totalPages - 1;

	if (!showLeftEllipsis && showRightEllipsis) {
		return [...range(1, 5), 'ellipsis', totalPages];
	}
	if (showLeftEllipsis && !showRightEllipsis) {
		return [1, 'ellipsis', ...range(totalPages - 4, totalPages)];
	}
	return [1, 'ellipsis', ...range(left, right), 'ellipsis', totalPages];
}

function range(start: number, end: number) {
	const items: number[] = [];
	for (let value = start; value <= end; value += 1) {
		items.push(value);
	}
	return items;
}
