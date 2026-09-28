'use server';

import { env } from '@/data/env/client';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { getImageKitAuthParams } from '@/features/uploads/imagekit';

export type ImageKitAuthResult =
	| { ok: true; token: string; expire: number; signature: string; publicKey: string }
	| { ok: false; error: string };

export async function getImageKitAuthAction(): Promise<ImageKitAuthResult> {
	const { userId } = await getCurrentUser();
	if (!userId) {
		return { ok: false, error: 'Sign in to continue' };
	}

	const params = getImageKitAuthParams();
	return {
		ok: true,
		token: params.token,
		expire: params.expire,
		signature: params.signature,
		publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
	};
}
