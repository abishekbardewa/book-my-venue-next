import NextAuth from 'next-auth';
import { authConfig } from '@/authConfig';

const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
	matcher: [
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		'/(api|trpc)(.*)',
	],
};
