import type { BookingStatus, PaymentStatus } from '@/features/bookings/constants';
import { cn } from '@/lib/utils';

type BookingStatusBadgeProps = {
	status: BookingStatus | PaymentStatus;
	className?: string;
};

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
	const label = status.replaceAll('_', ' ');
	const showDot =
		status === 'SUCCESS' ||
		status === 'CONFIRMED' ||
		status === 'COMPLETED' ||
		status === 'PENDING' ||
		status === 'AWAITING_OWNER_APPROVAL';

	return (
		<span
			className={cn(
				'inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase',
				(status === 'SUCCESS' || status === 'CONFIRMED' || status === 'COMPLETED') &&
					'border-structural-border bg-card text-foreground',
				(status === 'PENDING' || status === 'AWAITING_OWNER_APPROVAL') &&
					'border-structural-border bg-secondary text-foreground',
				(status === 'FAILED' || status === 'CANCELLED') &&
					'border-destructive/30 bg-destructive/5 text-destructive',
				status === 'REFUNDED' &&
					'border-structural-border bg-secondary text-muted-foreground',
				className
			)}
		>
			{showDot ? (
				<span
					className={cn(
						'size-1.5 shrink-0',
						(status === 'SUCCESS' || status === 'CONFIRMED' || status === 'COMPLETED') &&
							'bg-emerald-600',
						(status === 'PENDING' || status === 'AWAITING_OWNER_APPROVAL') &&
							'bg-amber-500'
					)}
					aria-hidden
				/>
			) : null}
			{label}
		</span>
	);
}
