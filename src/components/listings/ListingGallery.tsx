'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ListingGalleryProps = {
	propertyName: string;
	images: string[];
};

export function ListingGallery({ propertyName, images }: ListingGalleryProps) {
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);

	const total = images.length;
	const display = [images[0], images[1], images[2], images[3], images[4]] as const;

	const openAt = useCallback(
		(index: number) => {
			if (total === 0) return;
			setActiveIndex(Math.min(Math.max(index, 0), total - 1));
			setOpen(true);
		},
		[total],
	);

	const goPrev = useCallback(() => {
		setActiveIndex((index) => (index <= 0 ? total - 1 : index - 1));
	}, [total]);

	const goNext = useCallback(() => {
		setActiveIndex((index) => (index >= total - 1 ? 0 : index + 1));
	}, [total]);

	useEffect(() => {
		if (!open) return;
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'ArrowLeft') goPrev();
			if (event.key === 'ArrowRight') goNext();
		}
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [goNext, goPrev, open]);

	if (!display[0]) {
		return (
			<div className="mb-12 flex h-[280px] items-center justify-center border border-dashed border-structural-border bg-secondary text-sm text-muted-foreground md:mb-16 md:h-[512px]">
				No photos yet
			</div>
		);
	}

	return (
		<>
			<div className="mb-12 grid h-[320px] grid-cols-1 gap-1 md:mb-16 md:h-[560px] md:grid-cols-4 md:gap-2 lg:h-[614px]">
				<button type="button" onClick={() => openAt(0)} className="group relative h-full overflow-hidden bg-muted md:col-span-2">
					<Image
						src={display[0]}
						alt={`${propertyName} main photo`}
						fill
						priority
						sizes="(max-width: 768px) 100vw, 50vw"
						className="object-cover transition-transform duration-700 group-hover:scale-105"
					/>
				</button>

				<div className="hidden h-full grid-rows-2 gap-2 md:grid">
					{display[1] ? (
						<button type="button" onClick={() => openAt(1)} className="group relative h-full overflow-hidden bg-muted">
							<Image
								src={display[1]}
								alt={`${propertyName} photo 2`}
								fill
								sizes="25vw"
								className="object-cover transition-transform duration-700 group-hover:scale-105"
							/>
						</button>
					) : (
						<div className="bg-secondary" />
					)}
					{display[2] ? (
						<button type="button" onClick={() => openAt(2)} className="group relative h-full overflow-hidden bg-muted">
							<Image
								src={display[2]}
								alt={`${propertyName} photo 3`}
								fill
								sizes="25vw"
								className="object-cover transition-transform duration-700 group-hover:scale-105"
							/>
						</button>
					) : (
						<div className="bg-secondary" />
					)}
				</div>

				<div className="hidden h-full grid-rows-2 gap-2 md:grid">
					{display[3] ? (
						<button type="button" onClick={() => openAt(3)} className="group relative h-full overflow-hidden bg-muted">
							<Image
								src={display[3]}
								alt={`${propertyName} photo 4`}
								fill
								sizes="25vw"
								className="object-cover transition-transform duration-700 group-hover:scale-105"
							/>
						</button>
					) : (
						<div className="bg-secondary" />
					)}
					<button type="button" onClick={() => openAt(display[4] ? 4 : 0)} className="group relative h-full overflow-hidden bg-muted">
						{display[4] ? (
							<Image
								src={display[4]}
								alt={`${propertyName} photo 5`}
								fill
								sizes="25vw"
								className={cn('object-cover transition-transform duration-700 group-hover:scale-105', total > 5 && 'opacity-80')}
							/>
						) : (
							<div className="absolute inset-0 bg-secondary" />
						)}
						{total > 0 ? (
							<div className="absolute inset-0 flex items-center justify-center bg-background/55 transition-colors group-hover:bg-background/40">
								<span className="border border-primary bg-card/80 px-4 py-2 text-xs font-semibold tracking-[0.1em] text-foreground uppercase backdrop-blur-md">
									View all {total} photos
								</span>
							</div>
						) : null}
					</button>
				</div>
			</div>

			<div className="mb-8 md:hidden">
				<button type="button" onClick={() => openAt(0)} className="label-caps w-full border border-structural-border px-4 py-3 text-ink">
					View all {total} photos
				</button>
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					showCloseButton={false}
					className="max-h-[95vh] w-[min(100vw-1.5rem,1100px)] max-w-none gap-0 overflow-hidden rounded-none border-structural-border bg-background p-0 sm:max-w-none"
				>
					<DialogTitle className="sr-only">
						{propertyName} photos ({activeIndex + 1} of {total})
					</DialogTitle>

					<div className="flex items-center justify-between border-b border-structural-border px-4 py-3">
						<p className="label-caps text-muted-foreground">
							{activeIndex + 1} / {total}
						</p>
						<button
							type="button"
							aria-label="Close gallery"
							onClick={() => setOpen(false)}
							className="inline-flex size-9 items-center justify-center border border-structural-border text-foreground transition-colors hover:border-primary hover:text-foreground"
						>
							<X className="size-4" aria-hidden />
						</button>
					</div>

					<div className="relative flex min-h-[50vh] items-center justify-center bg-foreground/5 sm:min-h-[70vh]">
						{total > 1 ? (
							<button
								type="button"
								aria-label="Previous photo"
								onClick={goPrev}
								className="absolute top-1/2 left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center border border-structural-border bg-card text-foreground transition-colors hover:border-primary hover:text-foreground sm:left-5"
							>
								<ChevronLeft className="size-5" aria-hidden />
							</button>
						) : null}

						<div className="relative mx-12 h-[45vh] w-full sm:mx-16 sm:h-[65vh]">
							{images[activeIndex] ? (
								<Image
									src={images[activeIndex]}
									alt={`${propertyName} photo ${activeIndex + 1}`}
									fill
									sizes="90vw"
									className="object-contain"
									priority
								/>
							) : null}
						</div>

						{total > 1 ? (
							<button
								type="button"
								aria-label="Next photo"
								onClick={goNext}
								className="absolute top-1/2 right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center border border-structural-border bg-card text-foreground transition-colors hover:border-primary hover:text-foreground sm:right-5"
							>
								<ChevronRight className="size-5" aria-hidden />
							</button>
						) : null}
					</div>

					{total > 1 ? (
						<div className="flex gap-2 overflow-x-auto border-t border-structural-border px-4 py-3">
							{images.map((src, index) => (
								<button
									key={`${src}-${index}`}
									type="button"
									onClick={() => setActiveIndex(index)}
									className={cn(
										'relative h-14 w-20 shrink-0 overflow-hidden border',
										index === activeIndex ? 'border-primary' : 'border-structural-border opacity-70 hover:opacity-100',
									)}
								>
									<Image src={src} alt="" fill sizes="80px" className="object-cover" />
								</button>
							))}
						</div>
					) : null}
				</DialogContent>
			</Dialog>
		</>
	);
}
