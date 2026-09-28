'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { rejectListingAction } from '@/features/admin/actions';
import { LISTING_REJECTION_REASONS } from '@/features/properties/rejectionReasons';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type RejectListingDialogProps = {
	listingId: string;
	propertyName: string;
	iconOnly?: boolean;
	className?: string;
};

export function RejectListingDialog({
	listingId,
	propertyName,
	iconOnly = false,
	className,
}: RejectListingDialogProps) {
	const [open, setOpen] = useState(false);
	const [reasonCode, setReasonCode] = useState('');
	const [note, setNote] = useState('');

	const selected = LISTING_REJECTION_REASONS.find((reason) => reason.code === reasonCode);
	const noteRequired = selected?.code === 'OTHER';
	const canSubmit = Boolean(reasonCode) && (!noteRequired || note.trim().length > 0);

	function resetForm() {
		setReasonCode('');
		setNote('');
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) resetForm();
			}}
		>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className={cn(
						iconOnly
							? 'size-8 border-destructive p-0 text-destructive'
							: 'w-full border-destructive/50 text-destructive hover:bg-destructive/10',
						className
					)}
					aria-label={iconOnly ? 'Reject listing' : undefined}
				>
					{iconOnly ? <X className="size-4" aria-hidden /> : 'Reject Listing'}
				</Button>
			</DialogTrigger>
			<DialogContent className="rounded-none">
				<form
					action={async (formData) => {
						await rejectListingAction(listingId, formData);
						resetForm();
						setOpen(false);
					}}
					className="space-y-4"
				>
					<DialogHeader>
						<DialogTitle className="font-headline">Reject listing</DialogTitle>
						<DialogDescription>
							Choose why “{propertyName}” was rejected. Some reasons allow the owner
							to fix and resubmit.
						</DialogDescription>
					</DialogHeader>
					<input type="hidden" name="reasonCode" value={reasonCode} />
					<div className="space-y-2">
						<Label className="label-caps">Rejection reason</Label>
						<Select value={reasonCode || undefined} onValueChange={setReasonCode}>
							<SelectTrigger className="w-full rounded-none border-structural-border">
								<SelectValue placeholder="Select a reason" />
							</SelectTrigger>
							<SelectContent className="rounded-none">
								{LISTING_REJECTION_REASONS.map((reason) => (
									<SelectItem key={reason.code} value={reason.code}>
										{reason.label}
										{reason.allowsResubmit ? '' : ' (final)'}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{selected ? (
							<p className="text-xs text-muted-foreground">
								{selected.allowsResubmit
									? 'Owner can edit and resubmit this listing.'
									: 'Final rejection — owner cannot resubmit.'}
							</p>
						) : null}
					</div>
					<div className="space-y-2">
						<Label htmlFor={`reject-note-${listingId}`} className="label-caps">
							{noteRequired ? 'Details (required)' : 'Additional note (optional)'}
						</Label>
						<Textarea
							id={`reject-note-${listingId}`}
							name="reasonNote"
							value={note}
							onChange={(event) => setNote(event.target.value)}
							required={noteRequired}
							rows={3}
							placeholder={
								noteRequired
									? 'Explain the rejection…'
									: 'Optional details for the owner…'
							}
							className="rounded-none border-structural-border"
						/>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type="submit" variant="destructive" disabled={!canSubmit}>
							Confirm Rejection
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
