'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
	CalendarDays,
	CheckCircle2,
	Info,
	XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	markAllNotificationsReadAction,
	markNotificationReadAction,
} from '@/features/notifications/actions';
import type {
	NotificationItem,
	NotificationType,
} from '@/features/notifications/types';
import { cn } from '@/lib/utils';

type NotificationKind = 'booking' | 'listing' | 'system';

function kindForType(type: NotificationType): NotificationKind {
	if (type.startsWith('LISTING_')) return 'listing';
	if (type.startsWith('BOOKING_')) return 'booking';
	return 'system';
}

function ctaLabel(type: NotificationType): string {
	switch (type) {
		case 'BOOKING_REQUEST':
			return 'Review';
		case 'LISTING_PENDING_REVIEW':
			return 'Review listing';
		case 'LISTING_APPROVED':
		case 'LISTING_REJECTED':
			return 'View listing';
		default:
			return 'View';
	}
}

function NotificationIcon({ kind }: { kind: NotificationKind }) {
	const iconClass = 'size-5';
	switch (kind) {
		case 'booking':
			return <CalendarDays className={iconClass} aria-hidden />;
		case 'listing':
			return <CheckCircle2 className={iconClass} aria-hidden />;
		case 'system':
			return <Info className={iconClass} aria-hidden />;
	}
}

function iconShellClass(kind: NotificationKind, unread: boolean) {
	if (!unread) {
		return 'border-structural-border bg-secondary/60 text-muted-foreground';
	}
	switch (kind) {
		case 'booking':
			return 'border-structural-border bg-secondary text-foreground';
		case 'listing':
			return 'border-primary/30 bg-primary/10 text-ink';
		default:
			return 'border-structural-border bg-secondary text-foreground';
	}
}

type NotificationsViewProps = {
	notifications: NotificationItem[];
};

export function NotificationsView({ notifications }: NotificationsViewProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const hasUnread = notifications.some((item) => !item.readAt);

	function markOneRead(id: string) {
		startTransition(async () => {
			await markNotificationReadAction(id);
			router.refresh();
		});
	}

	function markAllRead() {
		startTransition(async () => {
			await markAllNotificationsReadAction();
			router.refresh();
		});
	}

	return (
		<section className="page-container-wide py-10 sm:py-14">
			<header className="mb-10 flex flex-col gap-4 border-b border-structural-border pb-8 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
						Notifications
					</h1>
					<p className="mt-2 text-muted-foreground sm:text-lg">
						Stay updated on your venue activities.
					</p>
				</div>
				{hasUnread ? (
					<button
						type="button"
						disabled={isPending}
						onClick={markAllRead}
						className={cn(
							buttonVariants({ variant: 'outline' }),
							'w-fit shrink-0 border-primary text-ink hover:bg-primary hover:text-primary-foreground'
						)}
					>
						Mark all as read
					</button>
				) : null}
			</header>

			{notifications.length === 0 ? (
				<div className="flex flex-col items-center justify-center border border-dashed border-structural-border px-6 py-16 text-center">
					<XCircle className="mb-3 size-8 text-muted-foreground" aria-hidden />
					<p className="font-headline text-lg font-semibold text-foreground">
						No notifications yet
					</p>
					<p className="mt-1 max-w-sm text-sm text-muted-foreground">
						Booking and listing updates will show up here.
					</p>
				</div>
			) : (
				<ul className="space-y-2">
					{notifications.map((item) => {
						const unread = !item.readAt;
						const kind = kindForType(item.type);
						const timeLabel = formatDistanceToNow(new Date(item.createdAt), {
							addSuffix: true,
						});

						return (
							<li key={item.id}>
								<article
									className={cn(
										'relative flex gap-4 overflow-hidden border p-4 transition-colors sm:p-5',
										unread
											? 'border-structural-border bg-card hover:bg-secondary/40'
											: 'border-structural-border bg-background opacity-75 hover:bg-secondary/30 hover:opacity-100'
									)}
								>
									{unread ? (
										<span
											className="absolute inset-y-0 left-0 w-1 bg-primary"
											aria-hidden
										/>
									) : null}

									<div
										className={cn(
											'flex size-12 shrink-0 items-center justify-center border',
											iconShellClass(kind, unread)
										)}
									>
										<NotificationIcon kind={kind} />
									</div>

									<div className="min-w-0 flex-1">
										<div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
											<h2 className="font-headline text-lg font-semibold tracking-tight text-foreground">
												{item.title}
											</h2>
											<span
												className={cn(
													'label-caps inline-flex shrink-0 items-center gap-1.5 text-[10px] tracking-[0.12em]',
													unread ? 'text-ink' : 'text-muted-foreground'
												)}
											>
												{unread ? (
													<span
														className="size-2 shrink-0 bg-primary"
														aria-hidden
													/>
												) : null}
												{timeLabel}
											</span>
										</div>

										<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
											{item.body}
										</p>

										{(item.href || unread) && (
											<div className="mt-4 flex flex-wrap gap-2">
												{item.href ? (
													<Button asChild size="sm">
														<Link
															href={item.href}
															onClick={() => {
																if (unread) markOneRead(item.id);
															}}
														>
															{ctaLabel(item.type)}
														</Link>
													</Button>
												) : null}
												{unread ? (
													<button
														type="button"
														disabled={isPending}
														onClick={() => markOneRead(item.id)}
														className="label-caps px-3 py-2 text-[10px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
													>
														Mark as read
													</button>
												) : null}
											</div>
										)}
									</div>
								</article>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
