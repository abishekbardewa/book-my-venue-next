import {
	ALLOWED_IMAGE_TYPES,
	MAX_UPLOAD_BYTES,
	type ImageKitFolder,
} from '@/features/uploads/constants';

export function validateImageFile(file: File) {
	const typeOk =
		ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number]) ||
		/\.(jpe?g|png)$/i.test(file.name);
	if (!typeOk) {
		return 'Only jpg/jpeg and png files are allowed.';
	}
	if (file.size > MAX_UPLOAD_BYTES) {
		return 'File size exceeds 5MB limit.';
	}
	return null;
}

export async function resizeImageFile(file: File, maxPx: number): Promise<Blob> {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d');
	if (!context) {
		bitmap.close();
		return file;
	}
	context.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();

	const blob = await new Promise<Blob | null>((resolve) => {
		canvas.toBlob(resolve, 'image/webp', 0.8);
	});
	return blob ?? file;
}
