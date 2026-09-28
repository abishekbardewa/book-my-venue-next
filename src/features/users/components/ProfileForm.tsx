'use client';

import { useActionState, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import {
	updateProfileAction,
	type ProfileActionState,
} from '@/features/users/actions';
import type { AppUserRole, PublicAppUser } from '@/features/users/db';
import { AVATAR_IMAGE_MAX_PX, IMAGEKIT_FOLDERS } from '@/features/uploads/constants';
import { validateImageFile } from '@/features/uploads/resize';
import { uploadFileToImageKit } from '@/features/uploads/uploadClient';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { fieldClassName } from '@/components/ui/fieldStyles';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChangePasswordForm } from '@/features/users/components/ChangePasswordForm';
import { cn } from '@/lib/utils';

type ProfileFormProps = {
	user: PublicAppUser;
	hasPassword?: boolean;
};

const initialState: ProfileActionState = {};

export function ProfileForm({ user, hasPassword = false }: ProfileFormProps) {
	const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [removeAvatar, setRemoveAvatar] = useState(false);
	const [fileError, setFileError] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		if (state.success) {
			toast.success('Profile updated');
			setPendingFile(null);
			setRemoveAvatar(false);
		}
		if (state.error) {
			toast.error(state.error);
		}
	}, [state]);

	function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;

		const error = validateImageFile(file);
		if (error) {
			setFileError(error);
			return;
		}

		setFileError(null);
		setRemoveAvatar(false);
		setPendingFile(file);
		setAvatarPreview(URL.createObjectURL(file));
	}

	function handleRemoveAvatar() {
		if (pendingFile && avatarPreview?.startsWith('blob:')) {
			URL.revokeObjectURL(avatarPreview);
		}
		setPendingFile(null);
		setRemoveAvatar(true);
		setAvatarPreview(null);
		setFileError(null);
	}

	async function clientAction(formData: FormData) {
		try {
			if (pendingFile) {
				setUploading(true);
				const uploaded = await uploadFileToImageKit({
					file: pendingFile,
					folder: IMAGEKIT_FOLDERS.avatars,
					maxPx: AVATAR_IMAGE_MAX_PX,
				});
				formData.set('avatarUrl', uploaded.url);
				formData.set('avatarImagekitFileId', uploaded.fileId);
			}
			if (removeAvatar) {
				formData.set('removeAvatar', 'true');
			}
		} catch (error) {
			setUploading(false);
			toast.error(error instanceof Error ? error.message : 'Could not upload photo');
			return;
		}
		setUploading(false);
		formAction(formData);
	}

	const firstName = state.values?.firstName ?? user.firstName ?? '';
	const lastName = state.values?.lastName ?? user.lastName ?? '';
	const phone = state.values?.phone ?? user.phone ?? '';
	const busy = pending || uploading;
	const display =
		[state.values?.firstName ?? user.firstName, state.values?.lastName ?? user.lastName]
			.filter(Boolean)
			.join(' ')
			.trim() ||
		user.email.split('@')[0] ||
		'User';

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
			<aside className="lg:col-span-4">
				<div className="flex flex-col items-center gap-4 border border-structural-border bg-card p-6 text-center lg:sticky lg:top-24">
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className={cn(
							'group relative size-40 overflow-hidden rounded-full border-2 border-primary bg-secondary',
							'transition hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
						)}
						aria-label="Choose profile photo"
						disabled={busy}
					>
						{avatarPreview ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={avatarPreview} alt="" className="size-full object-cover" />
						) : (
							<div className="flex size-full items-center justify-center">
								<UserRound className="size-16 text-muted-foreground" aria-hidden />
							</div>
						)}
						<span className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
							<Camera className="size-8 text-primary" aria-hidden />
						</span>
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".jpg,.jpeg,.png"
						className="hidden"
						onChange={handleAvatarChange}
						disabled={busy}
					/>
					<div>
						<h2 className="font-headline text-xl font-semibold text-foreground">{display}</h2>
						<p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
					</div>
					<span className="border border-structural-border bg-secondary/50 px-3 py-1 text-[10px] font-semibold tracking-widest text-foreground uppercase">
						{roleLabel(user.role)}
					</span>
					{avatarPreview || user.avatar ? (
						<button
							type="button"
							className="text-sm text-ink underline-offset-4 hover:underline"
							onClick={handleRemoveAvatar}
							disabled={busy}
						>
							Remove photo
						</button>
					) : null}
					<FieldError message={fileError} />
				</div>
			</aside>

			<div className="space-y-8 lg:col-span-8">
				<form
					id="profile-details-form"
					key={JSON.stringify(state.values ?? {})}
					action={clientAction}
					noValidate
					className="border border-structural-border bg-card"
				>
					<div className="space-y-8 p-6 sm:p-8">
						<h2 className="font-headline border-b border-structural-border pb-3 text-2xl font-semibold text-foreground">
							Personal Details
						</h2>

						<div className="grid gap-6 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="firstName" className="text-muted-foreground">
									First Name
								</Label>
								<Input
									id="firstName"
									name="firstName"
									defaultValue={firstName}
									autoComplete="given-name"
									required
									className={fieldClassName}
								/>
								<FieldError message={state.fieldErrors?.firstName} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName" className="text-muted-foreground">
									Last Name
								</Label>
								<Input
									id="lastName"
									name="lastName"
									defaultValue={lastName}
									autoComplete="family-name"
									required
									className={fieldClassName}
								/>
								<FieldError message={state.fieldErrors?.lastName} />
							</div>
						</div>

						<div className="space-y-2 sm:max-w-md">
							<Label htmlFor="phone" className="text-muted-foreground">
								Phone
							</Label>
							<div className="flex items-stretch border border-structural-border bg-secondary/40">
								<span className="inline-flex items-center border-r border-structural-border px-3 text-sm text-muted-foreground">
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
									className="h-11 flex-1 rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:border-primary focus-visible:ring-0"
									required
								/>
							</div>
							<FieldError message={state.fieldErrors?.phone} />
						</div>
					</div>

					<div className="flex justify-end border-t border-structural-border bg-secondary/40 px-6 py-4 sm:px-8">
						<Button
							type="submit"
							size="lg"
							disabled={busy || Boolean(fileError)}
							className="min-w-44"
						>
							{uploading ? 'Uploading…' : pending ? 'Saving…' : 'Save Changes'}
						</Button>
					</div>
				</form>

				{hasPassword ? <ChangePasswordForm /> : null}
			</div>
		</div>
	);
}

function roleLabel(role: AppUserRole) {
	switch (role) {
		case 'OWNER':
			return 'Owner';
		case 'PLATFORM_ADMIN':
			return 'Platform Admin';
		case 'CUSTOMER':
			return 'Customer';
		default:
			return 'User';
	}
}
