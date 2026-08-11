'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, CalendarDays, Shield } from 'lucide-react';
import type { AppUserRole } from '@/features/users/db';
import { cn } from '@/lib/utils';

type NavItem = {
	href: string;
	label: string;
	icon: typeof Building2;
	match: (pathname: string) => boolean;
};

function isOwnerPropertyPath(pathname: string) {
	if (!pathname.startsWith('/owner')) return false;
	if (pathname.startsWith('/owner/bookings')) return false;
	if (pathname.startsWith('/owner/profile')) return false;
	return true;
}

function linksForRole(role: AppUserRole): NavItem[] {
	switch (role) {
		case 'OWNER':
			return [
				{
					href: '/owner/bookings',
					label: 'Booking',
					icon: CalendarDays,
					match: (pathname) => pathname.startsWith('/owner/bookings'),
				},
				{
					href: '/owner',
					label: 'Property',
					icon: Building2,
					match: isOwnerPropertyPath,
				},
			];
		case 'PLATFORM_ADMIN':
			return [
				{
					href: '/admin',
					label: 'Admin',
					icon: Shield,
					match: (pathname) => pathname.startsWith('/admin'),
				},
			];
		default:
			return [];
	}
}

type SiteHeaderNavProps = {
	role: AppUserRole;
};

export function SiteHeaderNav({ role }: SiteHeaderNavProps) {
	const pathname = usePathname();
	const links = linksForRole(role);

	if (links.length === 0) {
		return null;
	}

	return (
		<nav aria-label="Primary" className="flex shrink-0 items-center gap-5 sm:gap-6">
			{links.map((item) => {
				const Icon = item.icon;
				const active = item.match(pathname);

				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							'inline-flex items-center gap-1.5 text-sm transition-colors',
							active
								? 'font-semibold text-foreground'
								: 'font-medium text-muted-foreground hover:text-foreground'
						)}
					>
						<Icon className="size-4" aria-hidden />
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
