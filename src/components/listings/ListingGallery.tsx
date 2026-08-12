import Image from 'next/image';

type ListingGalleryProps = {
	propertyName: string;
	images: string[];
};

export function ListingGallery({ propertyName, images }: ListingGalleryProps) {
	const [hero, ...thumbs] = images;
	const sideImages = thumbs.slice(0, 4);

	return (
		<div className="overflow-hidden rounded-xl">
			<div className="grid h-[280px] grid-cols-1 gap-2 sm:h-[360px] md:h-[420px] md:grid-cols-2">
				<div className="relative overflow-hidden rounded-xl bg-muted md:rounded-l-xl md:rounded-r-none">
					<Image
						src={hero}
						alt={`${propertyName} main photo`}
						fill
						priority
						sizes="(max-width: 768px) 100vw, 50vw"
						className="object-cover"
					/>
				</div>
				<div className="hidden grid-cols-2 grid-rows-2 gap-2 md:grid">
					{sideImages.map((src, index) => (
						<div key={src} className="relative overflow-hidden rounded-md bg-muted">
							<Image
								src={src}
								alt={`${propertyName} photo ${index + 2}`}
								fill
								sizes="25vw"
								className="object-cover"
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
