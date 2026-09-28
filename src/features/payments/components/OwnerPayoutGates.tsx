'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

type AddPropertyButtonProps = {
	canList: boolean;
	label?: string;
};

export function AddPropertyButton({ canList, label = 'Add Listing' }: AddPropertyButtonProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	if (canList) {
		return (
			<a href="/owner/properties/new" className={buttonVariants({ size: 'lg' })}>
				{label}
			</a>
		);
	}

	return (
		<>
			<Button type="button" size="lg" onClick={() => setOpen(true)}>
				{label}
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Set up payouts first</DialogTitle>
						<DialogDescription>
							You need active payouts before you can list a property.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							Not now
						</Button>
						<Button
							type="button"
							onClick={() => {
								setOpen(false);
								router.push('/settings?tab=payouts');
							}}
						>
							Set up payouts
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

type PayoutPromptDialogProps = {
	open: boolean;
};

export function PayoutPromptDialog({ open: initiallyOpen }: PayoutPromptDialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(initiallyOpen);

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) {
					router.replace('/owner');
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Set up payouts</DialogTitle>
					<DialogDescription>
						Connect payouts to receive your share after bookings are confirmed. You can skip
						for now.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							setOpen(false);
							router.replace('/owner');
						}}
					>
						Skip
					</Button>
					<Button
						type="button"
						onClick={() => {
							setOpen(false);
							router.push('/settings?tab=payouts');
						}}
					>
						Set up payouts
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
