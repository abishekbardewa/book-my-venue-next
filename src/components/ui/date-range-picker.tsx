'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DateRangePickerProps = {
	range?: DateRange;
	onSelect: (range: DateRange) => DateRange | undefined;
	disabled?: (date: Date) => boolean;
	triggerDisabled?: boolean;
	placeholder?: string;
	id?: string;
	className?: string;
	numberOfMonths?: number;
};

function isCompleteRange(range?: DateRange): range is { from: Date; to: Date } {
	return Boolean(range?.from && range?.to);
}

function formatRangeLabel(range?: DateRange) {
	if (!isCompleteRange(range)) return null;
	return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`;
}

export function DateRangePicker({
	range,
	onSelect,
	disabled,
	triggerDisabled = false,
	placeholder = 'Add dates',
	id,
	className,
	numberOfMonths = 2,
}: DateRangePickerProps) {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState<DateRange | undefined>(range);
	const label = formatRangeLabel(range);

	function handleOpenChange(nextOpen: boolean) {
		if (triggerDisabled) {
			setOpen(false);
			return;
		}
		if (nextOpen) {
			setDraft(isCompleteRange(range) ? range : undefined);
			setOpen(true);
			return;
		}
		setDraft(isCompleteRange(range) ? range : undefined);
		setOpen(false);
	}

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					disabled={triggerDisabled}
					data-empty={!label}
					className={cn(
						'h-auto w-full justify-start gap-2 p-0 px-0 has-[>svg]:px-0 text-left font-normal tracking-normal normal-case shadow-none',
						'data-[empty=true]:text-muted-foreground',
						className,
					)}
				>
					<CalendarIcon className="size-4 shrink-0" aria-hidden />
					<span>{label ?? placeholder}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto overflow-hidden rounded-none p-0" align="start">
				<Calendar
					mode="range"
					required
					resetOnSelect
					excludeDisabled
					numberOfMonths={numberOfMonths}
					selected={draft}
					onSelect={(next) => {
						setDraft(next);
						if (!isCompleteRange(next)) return;

						const applied = onSelect(next);
						if (isCompleteRange(applied)) {
							setDraft(applied);
							setOpen(false);
							return;
						}
						setDraft(applied?.from ? { from: applied.from, to: undefined } : undefined);
					}}
					disabled={disabled}
					defaultMonth={range?.from ?? draft?.from}
				/>
			</PopoverContent>
		</Popover>
	);
}
