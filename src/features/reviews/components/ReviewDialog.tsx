'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { saveReviewAction } from '@/features/reviews/actions';
import { REVIEW_BODY_MAX } from '@/features/reviews/constants';
import { reviewSchema } from '@/features/reviews/schemas';
import type { BookingReview } from '@/features/reviews/types';
import { cn } from '@/lib/utils';

type ReviewDialogProps = {
	open: boolean;
	bookingId: string;
	existing: BookingReview | null;
	onClose: () => void;
	onSaved: () => void;
};

export function ReviewDialog({
	open,
	bookingId,
	existing,
	onClose,
	onSaved,
}: ReviewDialogProps) {
	const [rating, setRating] = useState(existing?.rating ?? 0);
	const [body, setBody] = useState(existing?.body ?? '');
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
	const [pending, setPending] = useState(false);

	function resetFromExisting() {
		setRating(existing?.rating ?? 0);
		setBody(existing?.body ?? '');
		setFieldErrors({});
	}

	async function handleSubmit() {
		const parsed = reviewSchema.safeParse({ bookingId, rating, body });
		if (!parsed.success) {
			const next: Partial<Record<string, string>> = {};
			for (const issue of parsed.error.issues) {
				const field = issue.path[0];
				if (typeof field === 'string' && !next[field]) {
					next[field] = issue.message;
				}
			}
			setFieldErrors(next);
			return;
		}

		setPending(true);
		setFieldErrors({});
		try {
			const formData = new FormData();
			formData.set('bookingId', parsed.data.bookingId);
			formData.set('rating', String(parsed.data.rating));
			formData.set('body', parsed.data.body);
			const result = await saveReviewAction({}, formData);
			if (result.error || result.fieldErrors) {
				if (result.fieldErrors) setFieldErrors(result.fieldErrors);
				if (result.error) toast.error(result.error);
				return;
			}
			toast.success(existing ? 'Review updated' : 'Review added');
			onSaved();
			onClose();
		} finally {
			setPending(false);
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) {
					resetFromExisting();
					onClose();
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="font-headline">
						{existing ? 'Edit Review' : 'Add Review'}
					</DialogTitle>
					<DialogDescription>Rate this venue and share how the event went.</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="space-y-2 text-center">
						<div className="flex justify-center gap-1">
							{Array.from({ length: 5 }, (_, index) => {
								const value = index + 1;
								const filled = value <= rating;
								return (
									<button
										key={value}
										type="button"
										aria-label={`${value} star${value === 1 ? '' : 's'}`}
										className="rounded-none p-1 transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
										onClick={() => {
											setRating(value);
											setFieldErrors((current) => ({ ...current, rating: undefined }));
										}}
									>
										<Star
											className={cn(
												'size-8',
												filled ? 'fill-current text-foreground' : 'text-muted-foreground/30'
											)}
										/>
									</button>
								);
							})}
						</div>
						{fieldErrors.rating ? (
							<p className="text-sm text-destructive">{fieldErrors.rating}</p>
						) : null}
					</div>
					<div className="space-y-2">
						<Label htmlFor="review-body">Review</Label>
						<Textarea
							id="review-body"
							value={body}
							maxLength={REVIEW_BODY_MAX}
							rows={4}
							placeholder="Write your review"
							onChange={(event) => {
								setBody(event.target.value);
								setFieldErrors((current) => ({ ...current, body: undefined }));
							}}
						/>
						{fieldErrors.body ? (
							<p className="text-sm text-destructive">{fieldErrors.body}</p>
						) : null}
					</div>
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="button" disabled={pending} onClick={() => void handleSubmit()}>
						{pending ? 'Saving…' : 'Submit'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
