'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AppUserRole } from '@/features/users/db';

type UserAccountMenuProps = {
	email: string;
	firstName: string | null;
	lastName: string | null;
	avatar: string | null;
	role: AppUserRole;
	signOutAction: () => Promise<void>;
};

function getInitials(firstName: string | null, lastName: string | null, email: string) {
	const first = firstName?.trim().charAt(0);
	const last = lastName?.trim().charAt(0);
	if (first && last) {
		return `${first}${last}`.toUpperCase();
	}
	if (first) {
		return first.toUpperCase();
	}
	return email.charAt(0).toUpperCase();
}

function formatRoleLabel(role: AppUserRole) {
	switch (role) {
		case 'PLATFORM_ADMIN':
			return 'Platform admin';
		case 'OWNER':
			return 'Owner';
		default:
			return 'Customer';
	}
}

export function UserAccountMenu({
	email,
	firstName,
	lastName,
	avatar,
	role,
	signOutAction,
}: UserAccountMenuProps) {
	const initials = getInitials(firstName, lastName, email);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label="Account menu"
				className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
			>
				<Avatar size="default" className="cursor-pointer">
					{avatar ? <AvatarImage src={avatar} alt="" /> : null}
					<AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
						{initials}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="min-w-56 overflow-hidden rounded-xl p-0"
			>
				<div className="bg-secondary/70 px-3 py-2.5">
					<p className="truncate text-sm font-medium text-foreground">{email}</p>
					<Badge variant="secondary" className="mt-2">
						{formatRoleLabel(role)}
					</Badge>
				</div>
				<DropdownMenuSeparator className="my-0" />
				<form action={signOutAction}>
					<DropdownMenuItem
						variant="destructive"
						asChild
						className="rounded-none px-3 py-2.5 focus:rounded-none"
					>
						<button type="submit" className="w-full cursor-pointer">
							Log out
						</button>
					</DropdownMenuItem>
				</form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
