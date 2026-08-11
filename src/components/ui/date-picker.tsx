'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DatePickerProps = {
	date?: Date;
	onSelect: (date?: Date) => void;
	placeholder?: string;
	id?: string;
	disabled?: (date: Date) => boolean;
	className?: string;
};

export function DatePicker({
	date,
	onSelect,
	placeholder = 'Pick a date',
	id,
	disabled,
	className,
}: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					data-empty={!date}
					className={cn(
						'w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground',
						className
					)}
				>
					<CalendarIcon />
					{date ? format(date, 'PPP') : placeholder}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto overflow-hidden rounded-xl p-0" align="start">
				<Calendar mode="single" selected={date} onSelect={onSelect} disabled={disabled} />
			</PopoverContent>
		</Popover>
	);
}
