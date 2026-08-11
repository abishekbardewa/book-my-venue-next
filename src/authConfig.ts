import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
	pages: {
		signIn: '/sign-in',
		newUser: '/onboarding',
	},
	session: {
		strategy: 'jwt',
	},
	providers: [],
	callbacks: {
		authorized({ auth, request }) {
			const { pathname } = request.nextUrl;
			const isLoggedIn = !!auth?.user;

			if (pathname.startsWith('/api')) {
				return true;
			}

			const isAuthPage =
				pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
			const isProtected =
				pathname.startsWith('/onboarding') ||
				pathname.startsWith('/owner') ||
				pathname.startsWith('/admin');

			if (isAuthPage) {
				if (isLoggedIn) {
					return Response.redirect(new URL('/onboarding', request.nextUrl));
				}
				return true;
			}

			if (isProtected && !isLoggedIn) {
				return false;
			}

			return true;
		},
		jwt({ token, user }) {
			if (user?.id) {
				token.id = user.id;
			}
			return token;
		},
		session({ session, token }) {
			if (session.user && typeof token.id === 'string') {
				session.user.id = token.id;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;
