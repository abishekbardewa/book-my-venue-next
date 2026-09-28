import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { env } from '@/data/env/server';
import { authConfig } from '@/authConfig';
import { findOrCreateGoogleUser, getUserByEmail } from '@/features/users/db';

function googleProfileFields(profile: unknown) {
	if (!profile || typeof profile !== 'object') return null;
	const data = profile as {
		email?: string;
		email_verified?: boolean;
		given_name?: string;
		family_name?: string;
		picture?: string;
	};
	if (!data.email || data.email_verified === false) return null;
	return {
		email: data.email,
		firstName: data.given_name || null,
		lastName: data.family_name || null,
		avatar: data.picture || null,
	};
}

const credentialsSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	providers: [
		Google({
			clientId: env.GOOGLE_OAUTH_CLIENT_ID,
			clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
		}),
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
	callbacks: {
		...authConfig.callbacks,
		async signIn({ account, profile }) {
			if (account?.provider !== 'google') return true;
			const fields = googleProfileFields(profile);
			if (!fields) return false;
			const user = await findOrCreateGoogleUser(fields);
			return Boolean(user);
		},
		async jwt({ token, user, account, profile }) {
			if (account?.provider === 'google') {
				const fields = googleProfileFields(profile);
				if (fields) {
					const dbUser = await findOrCreateGoogleUser(fields);
					if (dbUser) token.id = dbUser.id;
				}
				return token;
			}
			if (user?.id) {
				token.id = user.id;
			}
			return token;
		},
	},
});
