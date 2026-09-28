'use client';

export function GoBackButton({ className }: { className?: string }) {
	return (
		<button
			type="button"
			onClick={() => window.history.back()}
			className={className}
		>
			Go Back
		</button>
	);
}
