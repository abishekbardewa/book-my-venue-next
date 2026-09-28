'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
	changePasswordAction,
	type ChangePasswordActionState,
} from '@/features/users/actions';
import { PasswordInput } from '@/features/users/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { fieldClassName } from '@/components/ui/fieldStyles';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const initialState: ChangePasswordActionState = {};

export function ChangePasswordForm() {
	const [state, formAction, pending] = useActionState(changePasswordAction, initialState);
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [formKey, setFormKey] = useState(0);

	useEffect(() => {
		if (state.success) {
			toast.success('Password updated');
			setNewPassword('');
			setConfirmPassword('');
			setFormKey((value) => value + 1);
		}
		if (state.error) {
			toast.error(state.error);
		}
	}, [state]);

	const matchOk =
		confirmPassword.length > 0 && newPassword.length > 0 && newPassword === confirmPassword;
	const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

	return (
		<form
			key={formKey}
			action={formAction}
			noValidate
			className="border border-structural-border bg-card"
		>
			<div className="space-y-8 p-6 sm:p-8">
				<h2 className="font-headline border-b border-structural-border pb-3 text-2xl font-semibold text-foreground">
					Change Password
				</h2>

				<div className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="currentPassword" className="text-muted-foreground">
							Current Password
						</Label>
						<PasswordInput
							id="currentPassword"
							name="currentPassword"
							autoComplete="current-password"
							placeholder="Enter current password"
							required
							className={fieldClassName}
						/>
						<FieldError message={state.fieldErrors?.currentPassword} />
					</div>

					<div className="space-y-2">
						<Label htmlFor="newPassword" className="text-muted-foreground">
							New Password
						</Label>
						<PasswordInput
							id="newPassword"
							name="newPassword"
							autoComplete="new-password"
							placeholder="Create new password"
							required
							value={newPassword}
							onChange={(event) => setNewPassword(event.target.value)}
							className={fieldClassName}
						/>
						<FieldError message={state.fieldErrors?.newPassword} />
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword" className="text-muted-foreground">
							Confirm New Password
						</Label>
						<PasswordInput
							id="confirmPassword"
							name="confirmPassword"
							autoComplete="new-password"
							placeholder="Re-enter new password"
							required
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							className={cn(
								fieldClassName,
								mismatch && 'border-destructive',
								matchOk && 'border-primary'
							)}
						/>
						{mismatch ? (
							<p className="text-xs text-destructive">Passwords do not match.</p>
						) : null}
						<FieldError message={state.fieldErrors?.confirmPassword} />
					</div>

					<FieldError message={state.error} />
				</div>
			</div>

			<div className="flex justify-end border-t border-structural-border bg-secondary/40 px-6 py-4 sm:px-8">
				<Button type="submit" size="lg" disabled={pending} className="min-w-44">
					{pending ? 'Updating…' : 'Change Password'}
				</Button>
			</div>
		</form>
	);
}
