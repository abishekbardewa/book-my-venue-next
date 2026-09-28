import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: ReactNode;
	className?: string;
};

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			role="status"
			className={cn(
				'flex flex-col items-center justify-center gap-3 px-6 py-24 text-center',
				className
			)}
		>
			<div className="flex size-16 items-center justify-center border border-structural-border bg-secondary text-muted-foreground">
				<Icon className="size-8" aria-hidden />
			</div>
			<div className="space-y-2">
				<p className="font-headline text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</p>
				{description ? (
					<p className="mx-auto max-w-sm text-sm text-muted-foreground sm:text-base">{description}</p>
				) : null}
			</div>
			{action ? <div className="mt-1">{action}</div> : null}
		</div>
	);
}
