import type { BookingStatus, PaymentStatus } from '@/features/bookings/constants';
import { cn } from '@/lib/utils';

type BookingStatusBadgeProps = {
	status: BookingStatus | PaymentStatus;
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium',
				(status === 'SUCCESS' || status === 'CONFIRMED' || status === 'COMPLETED') &&
					'bg-green-100 text-green-700',
				(status === 'PENDING' || status === 'AWAITING_OWNER_APPROVAL') &&
					'bg-amber-100 text-amber-700',
				(status === 'FAILED' || status === 'CANCELLED') &&
					'bg-red-100 text-red-700',
				status === 'REFUNDED' && 'bg-blue-100 text-blue-700'
			)}
		>
			{status.replaceAll('_', ' ')}
		</span>
	);
}
