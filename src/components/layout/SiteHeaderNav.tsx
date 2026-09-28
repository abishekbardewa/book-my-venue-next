'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AppUserRole } from '@/features/users/db';
import { cn } from '@/lib/utils';

type NavItem = {
	href: string;
	label: string;
	match: (pathname: string) => boolean;
};

function isOwnerListingPath(pathname: string) {
	if (!pathname.startsWith('/owner')) return false;
	if (pathname.startsWith('/owner/bookings')) return false;
	return true;
}

const PUBLIC_LINKS: NavItem[] = [
	{
		href: '/',
		label: 'Discover',
		match: (pathname) => pathname === '/',
	},
	{
		href: '/listings',
		label: 'Listings',
		match: (pathname) => pathname === '/listings' || pathname.startsWith('/listings/'),
	},
];

function roleLinks(role: AppUserRole | null): NavItem[] {
	if (!role) return [];
	switch (role) {
		case 'CUSTOMER':
			return [
				{
					href: '/bookings',
					label: 'Bookings',
					match: (pathname) => pathname.startsWith('/bookings'),
				},
			];
		case 'OWNER':
			return [
				{
					href: '/owner',
					label: 'Listing Management',
					match: isOwnerListingPath,
				},
				{
					href: '/owner/bookings',
					label: 'Manage Bookings',
					match: (pathname) => pathname.startsWith('/owner/bookings'),
				},
			];
		case 'PLATFORM_ADMIN':
			return [
				{
					href: '/admin',
					label: 'Listings Management',
					match: (pathname) => pathname.startsWith('/admin'),
				},
			];
		default:
			return [];
	}
}

type SiteHeaderNavProps = {
	role: AppUserRole | null;
};

export function SiteHeaderNav({ role }: SiteHeaderNavProps) {
	const pathname = usePathname();
	const links = [...PUBLIC_LINKS, ...roleLinks(role)];

	return (
		<nav
			aria-label="Primary"
			className="hidden items-center gap-8 md:flex lg:gap-10"
		>
			{links.map((item) => {
				const active = item.match(pathname);
				return (
					<Link
						key={`${item.href}-${item.label}`}
						href={item.href}
						className={cn(
							'label-caps border-b-2 pb-1 transition-[color,border-color] duration-200',
							active
								? 'border-primary text-foreground'
								: 'border-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground'
						)}
					>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
