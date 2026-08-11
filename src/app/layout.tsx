import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import './globals.css';

const fontSans = Inter({
	subsets: ['latin'],
	variable: '--font-sans',
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
				className={`${fontSans.variable} flex min-h-dvh flex-col font-sans antialiased`}
			>
				<AppProviders>
					<SiteHeader />
					<main className="flex-1">{children}</main>
					<SiteFooter />
				</AppProviders>
			</body>
		</html>
	);
}
