import { cn } from '@/lib/utils';

export const fieldClassName = cn(
	'h-11 rounded-none border border-structural-border bg-secondary/40 px-4 py-2.5 shadow-none',
	'focus-visible:border-primary focus-visible:ring-0',
	'disabled:cursor-not-allowed disabled:opacity-60',
);

export const textareaFieldClassName = cn(
	'min-h-28 rounded-none border border-structural-border bg-secondary/40 px-4 py-3 shadow-none resize-none',
	'focus-visible:border-primary focus-visible:ring-0',
	'disabled:cursor-not-allowed disabled:opacity-60',
);

export const selectFieldClassName = cn(
	'h-11 w-full appearance-none rounded-none border border-structural-border bg-secondary/40 px-4 text-sm outline-none',
	'focus:border-primary',
	'disabled:cursor-not-allowed disabled:opacity-60',
);
