'use client';

import { useState } from 'react';
import { rejectListingAction } from '@/features/admin/actions';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type RejectListingDialogProps = {
	listingId: string;
	propertyName: string;
};

export function RejectListingDialog({ listingId, propertyName }: RejectListingDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button" variant="destructive" size="sm">
					Reject
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form
					action={async (formData) => {
						await rejectListingAction(listingId, formData);
						setOpen(false);
					}}
					className="space-y-4"
				>
					<DialogHeader>
						<DialogTitle>Reject listing</DialogTitle>
						<DialogDescription>
							Tell the owner why “{propertyName}” was rejected.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<Label htmlFor={`reject-reason-${listingId}`}>Reason</Label>
						<Textarea
							id={`reject-reason-${listingId}`}
							name="reason"
							required
							rows={4}
							placeholder="Explain what needs to change"
							className="rounded-xl"
						/>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type="submit" variant="destructive">
							Reject listing
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
