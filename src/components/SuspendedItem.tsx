import { type ReactNode, Suspense } from 'react';

export function SuspendedItem<T>({
	item,
	fallback,
	result,
}: {
	item: Promise<T>;
	fallback: ReactNode;
	result: (item: T) => ReactNode;
}) {
	return (
		<Suspense fallback={fallback}>
			<InnerItem item={item} result={result} />
		</Suspense>
	);
}

async function InnerItem<T>({
	item,
	result,
}: {
	item: Promise<T>;
	result: (item: T) => ReactNode;
}) {
	return result(await item);
}
