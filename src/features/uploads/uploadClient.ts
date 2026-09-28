import { getImageKitAuthAction } from '@/features/uploads/actions';
import type { ImageKitFolder } from '@/features/uploads/constants';
import { resizeImageFile } from '@/features/uploads/resize';

export type UploadedImage = {
	url: string;
	fileId: string;
};

export async function uploadFileToImageKit(input: {
	file: File;
	folder: ImageKitFolder;
	maxPx: number;
}): Promise<UploadedImage> {
	const auth = await getImageKitAuthAction();
	if (!auth.ok) {
		throw new Error(auth.error);
	}

	const blob = await resizeImageFile(input.file, input.maxPx);
	const formData = new FormData();
	formData.append('file', blob, `${input.file.name.replace(/\.[^.]+$/, '')}.webp`);
	formData.append('fileName', `${input.file.name.replace(/\.[^.]+$/, '')}.webp`);
	formData.append('publicKey', auth.publicKey);
	formData.append('signature', auth.signature);
	formData.append('expire', String(auth.expire));
	formData.append('token', auth.token);
	formData.append('folder', input.folder);
	formData.append('useUniqueFileName', 'true');
	formData.append(
		'transformation',
		JSON.stringify({ pre: `w-${input.maxPx},q-80,f-webp` })
	);

	const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
		method: 'POST',
		body: formData,
	});
	const payload = (await response.json()) as {
		url?: string;
		fileId?: string;
		message?: string;
	};
	if (!response.ok || !payload.url || !payload.fileId) {
		throw new Error(payload.message || 'Could not upload image');
	}

	return { url: payload.url, fileId: payload.fileId };
}
