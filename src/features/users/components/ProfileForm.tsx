'use client';

import { useActionState, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { UserRound } from 'lucide-react';
import { toast } from 'sonner';
import {
	updateProfileAction,
	type ProfileActionState,
} from '@/features/users/actions';
import type { AppUser } from '@/features/users/db';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type ProfileFormProps = {
	user: AppUser;
};

const initialState: ProfileActionState = {};

export function ProfileForm({ user }: ProfileFormProps) {
	const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
	const [fileError, setFileError] = useState<string | null>(null);

	useEffect(() => {
		if (state.success) {
			toast.success('Profile updated');
		}
		if (state.error) {
			toast.error(state.error);
		}
	}, [state]);

	function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		const allowed = /(\.jpg|\.jpeg|\.png)$/i;
		if (!allowed.exec(file.name)) {
			setFileError('Only jpg/jpeg and png files are allowed.');
			return;
		}

		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			setFileError('File size exceeds 5MB limit.');
			return;
		}

		setFileError(null);
		const reader = new FileReader();
		reader.onload = () => {
			setAvatarPreview(typeof reader.result === 'string' ? reader.result : null);
		};
		reader.readAsDataURL(file);

		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}

	const firstName = state.values?.firstName ?? user.firstName ?? '';
	const lastName = state.values?.lastName ?? user.lastName ?? '';
	const phone = state.values?.phone ?? user.phone ?? '';

	return (
		<form
			key={JSON.stringify(state.values ?? {})}
			action={formAction}
			noValidate
			className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
		>
			<div className="space-y-6 p-4 sm:p-6">
				<div>
					<h2 className="text-base font-semibold text-foreground">Personal Information</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Ensure your profile information is up to date.
					</p>
				</div>

				<div className="space-y-1.5">
					<Label>Avatar</Label>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className={cn(
								'relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary',
								'ring-offset-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
							)}
							aria-label="Choose profile photo"
						>
							{avatarPreview ? (
								// Local preview only — ImageKit upload comes later
								// eslint-disable-next-line @next/next/no-img-element
								<img src={avatarPreview} alt="" className="size-full object-cover" />
							) : (
								<UserRound className="size-8 text-muted-foreground" aria-hidden />
							)}
						</button>
						<div className="text-sm text-muted-foreground">
							<p>JPG or PNG, up to 5MB.</p>
							<p className="mt-0.5">Photo upload will be enabled with ImageKit later.</p>
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept=".jpg,.jpeg,.png"
							className="hidden"
							onChange={handleAvatarChange}
						/>
					</div>
					<FieldError message={fileError} />
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="firstName">First name</Label>
						<Input
							id="firstName"
							name="firstName"
							defaultValue={firstName}
							autoComplete="given-name"
							required
						/>
						<FieldError message={state.fieldErrors?.firstName} />
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="lastName">Last name</Label>
						<Input
							id="lastName"
							name="lastName"
							defaultValue={lastName}
							autoComplete="family-name"
							required
						/>
						<FieldError message={state.fieldErrors?.lastName} />
					</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="email">Email</Label>
						<Input id="email" name="email" type="email" value={user.email} disabled readOnly />
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="phone">Phone</Label>
						<div className="flex items-center gap-2">
							<span className="inline-flex h-9 items-center rounded-full border border-input bg-secondary px-3 text-sm text-muted-foreground">
								+91
							</span>
							<Input
								id="phone"
								name="phone"
								type="tel"
								inputMode="numeric"
								placeholder="10-digit mobile"
								defaultValue={phone}
								autoComplete="tel-national"
								className="flex-1"
								required
							/>
						</div>
						<FieldError message={state.fieldErrors?.phone} />
					</div>
				</div>
			</div>

			<div className="flex justify-end border-t border-border bg-secondary/40 px-4 py-3 sm:px-6">
				<Button type="submit" disabled={pending || Boolean(fileError)} className="min-w-40">
					{pending ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		</form>
	);
}
