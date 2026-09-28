import type { Metadata } from 'next';
import { Hanken_Grotesk, Syne } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

const fontSans = Hanken_Grotesk({
	subsets: ['latin'],
	variable: '--font-sans',
	weight: ['400', '500', '600'],
});

const fontHeadline = Syne({
	subsets: ['latin'],
	variable: '--font-headline',
	weight: ['600', '700', '800'],
});

export const metadata: Metadata = {
	title: {
		default: 'Book My Venue',
		template: '%s | Book My Venue',
	},
	description: 'Discover and book event venues',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				suppressHydrationWarning
				className={`${fontSans.variable} ${fontHeadline.variable} flex min-h-dvh flex-col font-sans antialiased`}
			>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
