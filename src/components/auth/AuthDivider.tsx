import { fieldClassName } from '@/components/ui/fieldStyles';

export const authFieldClassName = fieldClassName;

export function AuthDivider({ label = 'Or' }: { label?: string }) {
	return (
		<div className="flex items-center gap-3">
			<div className="h-px flex-1 bg-structural-border" />
			<span className="label-caps text-muted-foreground">{label}</span>
			<div className="h-px flex-1 bg-structural-border" />
		</div>
	);
}
