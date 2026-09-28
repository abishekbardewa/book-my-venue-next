import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	client: {
		NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
		NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: z.string().min(1),
		NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.string().url(),
	},
	emptyStringAsUndefined: true,
	experimental__runtimeEnv: {
		NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
		NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
		NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
	},
});
