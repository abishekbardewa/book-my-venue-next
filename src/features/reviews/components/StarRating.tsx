import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
	rating: number;
	size?: 'sm' | 'md';
};

export function StarRating({ rating, size = 'sm' }: StarRatingProps) {
	const iconClass = size === 'md' ? 'size-5' : 'size-3.5';
	return (
		<div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
			{Array.from({ length: 5 }, (_, index) => {
				const filled = index < rating;
				return (
					<Star
						key={index}
						className={cn(
							iconClass,
							filled ? 'fill-primary text-primary' : 'text-muted-foreground/30'
						)}
						aria-hidden
					/>
				);
			})}
		</div>
	);
}
