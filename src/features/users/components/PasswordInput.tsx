'use client';

import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'> & {
	containerClassName?: string;
};

export function PasswordInput({ className, containerClassName, ...props }: PasswordInputProps) {
	const [visible, setVisible] = useState(false);

	return (
		<div className={cn('relative', containerClassName)}>
			<Input
				type={visible ? 'text' : 'password'}
				className={cn('pr-10', className)}
				{...props}
			/>
			<button
				type="button"
				onClick={() => setVisible((value) => !value)}
				className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
				aria-label={visible ? 'Hide password' : 'Show password'}
			>
				{visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
			</button>
		</div>
	);
}
