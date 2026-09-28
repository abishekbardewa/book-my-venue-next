'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
	ImagePlus,
	Lightbulb,
	RectangleHorizontal,
	Sparkles,
	Sun,
	Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { MAX_PROPERTY_IMAGES } from '@/features/uploads/constants';
import { validateImageFile } from '@/features/uploads/resize';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type LocalPropertyImage = {
	key: string;
	previewUrl: string;
	caption: string;
	file?: File;
	imgUrl?: string;
	imagekitFileId?: string;
};

type PropertyImagesFieldProps = {
	images: LocalPropertyImage[];
	onChange: (images: LocalPropertyImage[]) => void;
	disabled?: boolean;
};

const PHOTO_TIPS = [
	{
		icon: RectangleHorizontal,
		title: 'Landscape Orientation',
		body: 'Horizontal photos look best in our gallery format.',
	},
	{
		icon: Sun,
		title: 'Natural Lighting',
		body: 'Open blinds and turn on lights so spaces feel inviting.',
	},
	{
		icon: Sparkles,
		title: 'Show the Highlights',
		body: 'Capture halls, amenities, and outdoor areas bookers care about.',
	},
] as const;

export function PropertyImagesField({ images, onChange, disabled }: PropertyImagesFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);

	function appendFiles(files: File[]) {
		const remaining = MAX_PROPERTY_IMAGES - images.length;
		if (remaining <= 0) {
			toast.error(`Image limit reached. You can add up to ${MAX_PROPERTY_IMAGES} photos.`);
			return;
		}

		const next: LocalPropertyImage[] = [];
		for (const file of files.slice(0, remaining)) {
			const error = validateImageFile(file);
			if (error) {
				toast.error(error);
				continue;
			}
			next.push({
				key: crypto.randomUUID(),
				previewUrl: URL.createObjectURL(file),
				caption: '',
				file,
			});
		}
		if (next.length > 0) {
			onChange([...images, ...next]);
		}
	}

	function handleFiles(event: ChangeEvent<HTMLInputElement>) {
		const files = Array.from(event.target.files ?? []);
		event.target.value = '';
		if (files.length === 0) return;
		appendFiles(files);
	}

	function onDrop(event: DragEvent<HTMLButtonElement>) {
		event.preventDefault();
		setDragging(false);
		if (disabled) return;
		if (images.length >= MAX_PROPERTY_IMAGES) {
			toast.error(`Image limit reached. You can add up to ${MAX_PROPERTY_IMAGES} photos.`);
			return;
		}
		appendFiles(Array.from(event.dataTransfer.files ?? []));
	}

	function removeAt(index: number) {
		const target = images[index];
		if (target?.file) {
			URL.revokeObjectURL(target.previewUrl);
		}
		onChange(images.filter((_, itemIndex) => itemIndex !== index));
	}

	function updateCaption(index: number, caption: string) {
		onChange(
			images.map((item, itemIndex) =>
				itemIndex === index ? { ...item, caption } : item
			)
		);
	}

	const canAdd = !disabled && images.length < MAX_PROPERTY_IMAGES;

	return (
		<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
			<div className="space-y-8 lg:col-span-8">
				<input
					ref={inputRef}
					type="file"
					accept=".jpg,.jpeg,.png"
					multiple
					className="hidden"
					onChange={handleFiles}
					disabled={disabled}
				/>

				<button
					type="button"
					disabled={disabled}
					onClick={() => {
						if (!canAdd) {
							toast.error(`Image limit reached. You can add up to ${MAX_PROPERTY_IMAGES} photos.`);
							return;
						}
						inputRef.current?.click();
					}}
					onDragEnter={(event) => {
						event.preventDefault();
						if (!disabled) setDragging(true);
					}}
					onDragOver={(event) => {
						event.preventDefault();
						if (!disabled) setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={onDrop}
					className={cn(
						'relative flex min-h-[280px] w-full flex-col items-center justify-center border-2 border-dashed px-6 py-12 transition-colors sm:min-h-[300px]',
						dragging
							? 'border-primary bg-secondary/40'
							: 'border-structural-border bg-card hover:border-primary',
						(!canAdd || disabled) && 'opacity-60',
						disabled && 'cursor-not-allowed'
					)}
				>
					<div className="mb-4 bg-secondary/50 p-4">
						<ImagePlus className="size-12 text-primary" aria-hidden />
					</div>
					<h3 className="font-headline text-xl font-semibold text-foreground">
						Drag & drop photos here
					</h3>
					<p className="mt-2 text-muted-foreground">or click to browse from your computer</p>
					<p className="mt-6 text-center text-xs tracking-wide text-muted-foreground uppercase">
						JPG or PNG · up to 5MB each · max {MAX_PROPERTY_IMAGES}
						<br />
						Photos upload when you save
					</p>
				</button>

				{images.length > 0 ? (
					<div>
						<h3 className="font-headline mb-4 text-2xl font-semibold text-foreground">
							Your Gallery
						</h3>
						<ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
							{images.map((image, index) => (
								<li
									key={image.key}
									className="flex flex-col overflow-hidden border border-structural-border bg-card"
								>
									<div className="relative aspect-4/3 bg-muted">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={image.previewUrl}
											alt=""
											className="size-full object-cover"
										/>
										<button
											type="button"
											onClick={() => removeAt(index)}
											disabled={disabled}
											className="absolute top-2 right-2 bg-card/95 p-2 text-destructive transition-colors hover:bg-card"
											aria-label="Remove photo"
										>
											<Trash2 className="size-4" aria-hidden />
										</button>
									</div>
									<div className="border-t border-structural-border p-2">
										<label className="sr-only" htmlFor={`caption-${image.key}`}>
											Caption
										</label>
										<Input
											id={`caption-${image.key}`}
											value={image.caption}
											placeholder="Caption (optional)"
											onChange={(event) => updateCaption(index, event.target.value)}
											disabled={disabled}
											className="h-9 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
										/>
									</div>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</div>

			<aside className="flex flex-col gap-4 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
				<div className="border border-structural-border bg-secondary/40 p-5">
					<div className="mb-3 flex items-center gap-2">
						<Lightbulb className="size-5 text-primary" aria-hidden />
						<h4 className="font-headline text-lg font-semibold text-foreground">
							Photography Guide
						</h4>
					</div>
					<p className="text-sm text-muted-foreground">
						Great photos can significantly increase your booking rate. Follow these
						guidelines for the best results.
					</p>
				</div>
				{PHOTO_TIPS.map((tip) => {
					const Icon = tip.icon;
					return (
						<div
							key={tip.title}
							className="flex items-start gap-3 border border-structural-border bg-card p-4"
						>
							<Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
							<div>
								<h5 className="label-caps text-foreground">{tip.title}</h5>
								<p className="mt-1 text-sm text-muted-foreground">{tip.body}</p>
							</div>
						</div>
					);
				})}
			</aside>
		</div>
	);
}
