import { cn } from '@/lib/utils';

type BrandMarkProps = {
	className?: string;
	showWordmark?: boolean;
	size?: 'sm' | 'md';
};

export function BrandMark({ className, showWordmark = true, size = 'md' }: BrandMarkProps) {
	const wordmark =
		size === 'sm'
			? 'font-headline text-xl font-bold tracking-tighter sm:text-2xl'
			: 'font-headline text-2xl font-bold tracking-tighter sm:text-3xl';

	return (
		<span className={cn('inline-flex items-center gap-2', className)}>
			{showWordmark ? (
				<span className={cn('text-foreground uppercase', wordmark)}>
					BookMy<span className="text-primary">Venue</span>
				</span>
			) : (
				<span className={cn('text-foreground', wordmark)} aria-hidden>
					BMV
				</span>
			)}
		</span>
	);
}
