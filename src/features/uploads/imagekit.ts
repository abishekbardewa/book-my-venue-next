import ImageKit from '@imagekit/nodejs';
import { env } from '@/data/env/server';

export function getImageKitClient() {
	return new ImageKit({ privateKey: env.IMAGEKIT_PRIVATE_KEY });
}

export function getImageKitAuthParams() {
	return getImageKitClient().helper.getAuthenticationParameters();
}

export async function deleteImageKitFile(fileId: string) {
	if (!fileId) return;
	try {
		await getImageKitClient().files.delete(fileId);
	} catch (error) {
		console.error('ImageKit delete failed:', error);
	}
}

export async function deleteImageKitFiles(fileIds: Array<string | null | undefined>) {
	const ids = [...new Set(fileIds.filter((id): id is string => Boolean(id)))];
	await Promise.all(ids.map((id) => deleteImageKitFile(id)));
}
