import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	server: {
		DB_PASSWORD: z.string().min(1),
		DB_HOST: z.string().min(1),
		DB_PORT: z.string().min(1),
		DB_USER: z.string().min(1),
		DB_NAME: z.string().min(1),
		AUTH_SECRET: z.string().min(1),
		GOOGLE_OAUTH_CLIENT_ID: z.string().min(1),
		GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1),
		RAZORPAY_KEY_ID: z.string().min(1),
		RAZORPAY_KEY_SECRET: z.string().min(1),
		RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),
		IMAGEKIT_PRIVATE_KEY: z.string().min(1),
		PAYOUTS_ENABLED: z
			.enum(['true', 'false'])
			.default('false')
			.transform((value) => value === 'true'),
		/** node-cron expression: expire unpaid PENDING holds */
		BOOKING_CRON_PENDING: z.string().min(1).default('*/15 * * * *'),
		/** node-cron expression: cancel stale AWAITING_OWNER_APPROVAL */
		BOOKING_CRON_AWAITING: z.string().min(1).default('0 * * * *'),
		/** node-cron expression: mark past CONFIRMED bookings COMPLETED */
		BOOKING_CRON_COMPLETED: z.string().min(1).default('0 * * * *'),
		/** How long a PENDING booking can wait for payment before hold expires */
		BOOKING_PENDING_HOLD_MINUTES: z.coerce.number().int().positive().default(15),
		/** How long AWAITING_OWNER_APPROVAL can sit before auto-cancel + refund */
		BOOKING_AWAITING_TIMEOUT_MINUTES: z.coerce
			.number()
			.int()
			.positive()
			.default(1440),
		/** Days after stay endDate to allow add/edit review. 0 = no deadline. */
		REVIEW_WINDOW_DAYS: z.coerce.number().int().min(0).default(0),
	},
	createFinalSchema: (shape) => {
		return z.object(shape).transform((val) => {
			const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, ...rest } = val;
			return {
				...rest,
				DATABASE_URL: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
			};
		});
	},
	emptyStringAsUndefined: true,
	experimental__runtimeEnv: process.env,
});
