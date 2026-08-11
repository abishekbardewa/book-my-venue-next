import { cn } from '@/lib/utils';

type FieldErrorProps = {
	message?: string | null;
	className?: string;
};

export function FieldError({ message, className }: FieldErrorProps) {
	if (!message) {
		return null;
	}

	return <p className={cn('text-[11px] text-destructive', className)}>{message}</p>;
}
