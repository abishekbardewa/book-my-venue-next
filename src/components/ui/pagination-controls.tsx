'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildPaginationItems } from '@/lib/pagination';
import { cn } from '@/lib/utils';

type PaginationControlsProps = {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
	align?: 'center' | 'end';
};

export function PaginationControls({ page, totalPages, onPageChange, className, align = 'center' }: PaginationControlsProps) {
	if (totalPages <= 1) return null;

	const items = buildPaginationItems(page, totalPages);

	return (
		<nav
			aria-label="Pagination"
			className={cn('mt-8 flex flex-wrap items-center gap-2', align === 'end' ? 'justify-end' : 'justify-center', className)}
		>
			<Button type="button" variant="outline" size="sm" disabled={page <= 1} aria-label="Previous page" onClick={() => onPageChange(page - 1)}>
				<ChevronLeft className="size-4" aria-hidden />
				<span className="hidden sm:inline">Previous</span>
			</Button>

			<ul className="flex flex-wrap items-center gap-1">
				{items.map((item, index) => {
					if (item === 'ellipsis') {
						return (
							<li key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground" aria-hidden>
								…
							</li>
						);
					}

					const active = item === page;
					return (
						<li key={item}>
							<Button
								type="button"
								size="sm"
								variant={active ? 'default' : 'outline'}
								aria-label={`Page ${item}`}
								aria-current={active ? 'page' : undefined}
								className={cn('min-w-9', active && 'pointer-events-none')}
								onClick={() => onPageChange(item)}
							>
								{item}
							</Button>
						</li>
					);
				})}
			</ul>

			<Button type="button" variant="outline" size="sm" disabled={page >= totalPages} aria-label="Next page" onClick={() => onPageChange(page + 1)}>
				<span className="hidden sm:inline">Next</span>
				<ChevronRight className="size-4" aria-hidden />
			</Button>
		</nav>
	);
}
