import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

type BrandMarkProps = {
	className?: string;
	showWordmark?: boolean;
	size?: 'sm' | 'md';
};

export function BrandMark({ className, showWordmark = true, size = 'md' }: BrandMarkProps) {
	const box = size === 'sm' ? 'size-8 rounded-lg' : 'size-10 rounded-xl';
	const icon = size === 'sm' ? 'size-4' : 'size-5';

	return (
		<span className={cn('inline-flex items-center gap-2.5', className)}>
			<span
				className={cn(
					'inline-flex shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-sm',
					box
				)}
			>
				<MapPin className={cn(icon, 'fill-current')} aria-hidden />
			</span>
			{showWordmark ? (
				<span className="text-lg font-bold tracking-tight text-foreground uppercase sm:text-xl">
					bookmyvenue
				</span>
			) : null}
		</span>
	);
}
