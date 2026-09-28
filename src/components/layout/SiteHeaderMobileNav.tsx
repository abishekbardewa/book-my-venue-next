'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Bell, Menu, Settings, X } from 'lucide-react';
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

function linksFor(role: AppUserRole | null): NavItem[] {
	const publicLinks: NavItem[] = [
		{ href: '/', label: 'Discover', match: (pathname) => pathname === '/' },
		{
			href: '/listings',
			label: 'Listings',
			match: (pathname) =>
				pathname === '/listings' || pathname.startsWith('/listings/'),
		},
	];

	if (!role) return publicLinks;

	if (role === 'CUSTOMER') {
		return [
			...publicLinks,
			{
				href: '/bookings',
				label: 'Bookings',
				match: (pathname) => pathname.startsWith('/bookings'),
			},
		];
	}

	if (role === 'OWNER') {
		return [
			...publicLinks,
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
	}

	if (role === 'PLATFORM_ADMIN') {
		return [
			...publicLinks,
			{
				href: '/admin',
				label: 'Listings Management',
				match: (pathname) => pathname.startsWith('/admin'),
			},
		];
	}

	return publicLinks;
}

type SiteHeaderMobileNavProps = {
	role: AppUserRole | null;
	hasUnreadNotifications?: boolean;
};

export function SiteHeaderMobileNav({
	role,
	hasUnreadNotifications = false,
}: SiteHeaderMobileNavProps) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const links = linksFor(role);

	return (
		<div className="md:hidden">
			<button
				type="button"
				aria-label={open ? 'Close menu' : 'Open menu'}
				aria-expanded={open}
				onClick={() => setOpen((value) => !value)}
				className="p-2 text-muted-foreground transition-colors hover:text-foreground"
			>
				{open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
			</button>

			{open ? (
				<div className="absolute inset-x-0 top-20 z-50 border-b border-structural-border bg-card px-4 py-4 shadow-sm">
					<nav aria-label="Mobile" className="flex flex-col gap-1">
						{links.map((item) => {
							const active = item.match(pathname);
							return (
								<Link
									key={`${item.href}-${item.label}`}
									href={item.href}
									onClick={() => setOpen(false)}
									className={cn(
										'label-caps px-3 py-3 transition-colors',
										active
											? 'border-l-2 border-primary bg-secondary/50 text-foreground'
											: 'border-l-2 border-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
									)}
								>
									{item.label}
								</Link>
							);
						})}
						{role ? (
							<>
								<Link
									href="/notifications"
									onClick={() => setOpen(false)}
									className="label-caps mt-2 flex items-center gap-2 border-t border-structural-border px-3 pt-4 pb-2 text-muted-foreground hover:text-foreground"
								>
									<span className="relative inline-flex">
										<Bell className="size-4" aria-hidden />
										{hasUnreadNotifications ? (
											<span
												className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-red-500"
												aria-hidden
											/>
										) : null}
									</span>
									Notifications
								</Link>
								<Link
									href="/settings"
									onClick={() => setOpen(false)}
									className="label-caps flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground"
								>
									<Settings className="size-4" aria-hidden />
									Settings
								</Link>
							</>
						) : null}
					</nav>
				</div>
			) : null}
		</div>
	);
}
