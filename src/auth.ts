import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { authConfig } from '@/authConfig';
import { getUserByEmail } from '@/features/users/db';

const credentialsSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				const parsed = credentialsSchema.safeParse(credentials);
				if (!parsed.success) {
					return null;
				}

				const user = await getUserByEmail(parsed.data.email.toLowerCase());
				if (!user?.password || user.isDeleted) {
					return null;
				}

				const valid = await compare(parsed.data.password, user.password);
				if (!valid) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
					image: user.avatar,
				};
			},
		}),
	],
});
