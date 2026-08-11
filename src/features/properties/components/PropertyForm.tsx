'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
	savePropertyDraftAction,
	submitPropertyForReviewAction,
} from '@/features/properties/actions';
import {
	PROPERTY_CATEGORIES,
	PROPERTY_CITIES,
	PROPERTY_FORM_STEPS,
	type PropertyFormStepKey,
} from '@/features/properties/constants';
import type { PropertyFormValues } from '@/features/properties/schemas';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const emptyValues: PropertyFormValues = {
	propertyName: '',
	description: '',
	capacity: '',
	price: '',
	checkInTime: '',
	checkOutTime: '',
	address: '',
	city: '',
	country: 'India',
	pincode: '',
	extraInfo: '',
	tags: [],
	amenities: [],
};

type PropertyFormProps = {
	initialValues?: Partial<PropertyFormValues> & { id?: string };
};

export function PropertyForm({ initialValues }: PropertyFormProps) {
	const router = useRouter();
	const [stepIndex, setStepIndex] = useState(0);
	const [values, setValues] = useState<PropertyFormValues>({
		...emptyValues,
		...initialValues,
		tags: initialValues?.tags ?? [],
		amenities: initialValues?.amenities ?? [],
		id: initialValues?.id,
	});
	const [amenityDraft, setAmenityDraft] = useState('');
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
	const [formError, setFormError] = useState<string | undefined>();
	const [pending, startTransition] = useTransition();

	const step = PROPERTY_FORM_STEPS[stepIndex]!;
	const isLastStep = stepIndex === PROPERTY_FORM_STEPS.length - 1;

	function updateField<K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) {
		setValues((prev) => ({ ...prev, [key]: value }));
	}

	function toggleTag(tagName: string) {
		setValues((prev) => {
			const exists = prev.tags.includes(tagName);
			if (exists) {
				return { ...prev, tags: prev.tags.filter((tag) => tag !== tagName) };
			}
			if (prev.tags.length >= 3) {
				toast.error('You can select up to 3 categories');
				return prev;
			}
			return { ...prev, tags: [...prev.tags, tagName] };
		});
	}

	function addAmenity() {
		const next = amenityDraft.trim();
		if (!next) {
			return;
		}
		if (values.amenities.length >= 5) {
			toast.error('You can add up to 5 amenities');
			return;
		}
		if (values.amenities.includes(next)) {
			setAmenityDraft('');
			return;
		}
		updateField('amenities', [...values.amenities, next]);
		setAmenityDraft('');
	}

	function goNext() {
		if (step.key === 'details' && !values.propertyName.trim()) {
			setFieldErrors({ propertyName: 'Property name is required' });
			return;
		}
		setFieldErrors({});
		setStepIndex((index) => Math.min(index + 1, PROPERTY_FORM_STEPS.length - 1));
	}

	function goPrev() {
		setFieldErrors({});
		setStepIndex((index) => Math.max(index - 1, 0));
	}

	function saveDraft() {
		setFormError(undefined);
		setFieldErrors({});
		startTransition(async () => {
			const result = await savePropertyDraftAction(values);
			if (result.fieldErrors) {
				setFieldErrors(result.fieldErrors);
				toast.error('Fix the highlighted fields');
				return;
			}
			if (result.error) {
				setFormError(result.error);
				toast.error(result.error);
				return;
			}
			toast.success('Draft saved');
			if (result.propertyId && !values.id) {
				router.replace(`/owner/properties/${result.propertyId}/edit`);
				return;
			}
			if (result.propertyId) {
				updateField('id', result.propertyId);
			}
			router.push('/owner');
			router.refresh();
		});
	}

	function submitForReview() {
		setFormError(undefined);
		setFieldErrors({});
		startTransition(async () => {
			const result = await submitPropertyForReviewAction(values);
			if (result?.fieldErrors) {
				setFieldErrors(result.fieldErrors);
				toast.error('Fix the highlighted fields before submitting');
				return;
			}
			if (result?.error) {
				setFormError(result.error);
				toast.error(result.error);
			}
		});
	}

	return (
		<div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[220px_1fr]">
			<nav className="space-y-1">
				{PROPERTY_FORM_STEPS.map((item, index) => (
					<button
						key={item.key}
						type="button"
						onClick={() => setStepIndex(index)}
						className={cn(
							'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
							index === stepIndex
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:bg-secondary hover:text-foreground'
						)}
					>
						<span className="font-medium">{index + 1}.</span>
						{item.label}
					</button>
				))}
			</nav>

			<div className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">{step.label}</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{stepCopy(step.key)}
					</p>
				</div>

				{step.key === 'details' && (
					<div className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="propertyName">Property name</Label>
							<Input
								id="propertyName"
								value={values.propertyName}
								onChange={(event) => updateField('propertyName', event.target.value)}
							/>
							<FieldError message={fieldErrors.propertyName} />
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="capacity">Capacity</Label>
								<Input
									id="capacity"
									value={values.capacity ?? ''}
									onChange={(event) => updateField('capacity', event.target.value)}
								/>
								<FieldError message={fieldErrors.capacity} />
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="price">Price (INR)</Label>
								<Input
									id="price"
									value={values.price ?? ''}
									onChange={(event) => updateField('price', event.target.value)}
								/>
								<FieldError message={fieldErrors.price} />
							</div>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="checkInTime">Check-in time</Label>
								<Input
									id="checkInTime"
									type="time"
									value={values.checkInTime ?? ''}
									onChange={(event) => updateField('checkInTime', event.target.value)}
								/>
								<FieldError message={fieldErrors.checkInTime} />
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="checkOutTime">Check-out time</Label>
								<Input
									id="checkOutTime"
									type="time"
									value={values.checkOutTime ?? ''}
									onChange={(event) => updateField('checkOutTime', event.target.value)}
								/>
								<FieldError message={fieldErrors.checkOutTime} />
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								rows={5}
								maxLength={600}
								value={values.description ?? ''}
								onChange={(event) => updateField('description', event.target.value)}
							/>
							<FieldError message={fieldErrors.description} />
						</div>
					</div>
				)}

				{step.key === 'location' && (
					<div className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="city">City</Label>
							<select
								id="city"
								value={values.city ?? ''}
								onChange={(event) => updateField('city', event.target.value)}
								className="h-9 w-full rounded-full border border-input bg-transparent px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							>
								<option value="">Select a city</option>
								{PROPERTY_CITIES.map((city) => (
									<option key={city} value={city}>
										{city}
									</option>
								))}
							</select>
							<FieldError message={fieldErrors.city} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="address">Full address</Label>
							<Textarea
								id="address"
								rows={3}
								maxLength={300}
								value={values.address ?? ''}
								onChange={(event) => updateField('address', event.target.value)}
							/>
							<FieldError message={fieldErrors.address} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="pincode">Pin code</Label>
							<Input
								id="pincode"
								value={values.pincode ?? ''}
								onChange={(event) => updateField('pincode', event.target.value)}
							/>
							<FieldError message={fieldErrors.pincode} />
						</div>
						<p className="text-xs text-muted-foreground">
							Map pin (lat/lng) is skipped for now and can stay empty.
						</p>
					</div>
				)}

				{step.key === 'images' && (
					<div className="rounded-lg border border-dashed border-border bg-secondary/40 px-4 py-8 text-center">
						<p className="text-sm font-medium text-foreground">Images come later</p>
						<p className="mt-1 text-sm text-muted-foreground">
							ImageKit upload is deferred. You can continue without photos for now.
						</p>
					</div>
				)}

				{step.key === 'categories' && (
					<div className="space-y-6">
						<div className="space-y-2">
							<Label>Categories (max 3)</Label>
							<div className="flex flex-wrap gap-2">
								{PROPERTY_CATEGORIES.map((category) => {
									const selected = values.tags.includes(category.tagName);
									return (
										<button
											key={category.tagName}
											type="button"
											onClick={() => toggleTag(category.tagName)}
											className={cn(
												'rounded-full border px-3 py-1.5 text-sm transition-colors',
												selected
													? 'border-primary bg-primary text-primary-foreground'
													: 'border-border bg-card hover:bg-secondary'
											)}
										>
											{category.label}
										</button>
									);
								})}
							</div>
							<FieldError message={fieldErrors.tags} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="amenity">Amenities (optional, max 5)</Label>
							<div className="flex gap-2">
								<Input
									id="amenity"
									value={amenityDraft}
									onChange={(event) => setAmenityDraft(event.target.value)}
									placeholder="e.g. Parking"
								/>
								<Button type="button" variant="outline" onClick={addAmenity}>
									Add
								</Button>
							</div>
							{values.amenities.length > 0 && (
								<ul className="space-y-1">
									{values.amenities.map((amenity) => (
										<li
											key={amenity}
											className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
										>
											{amenity}
											<button
												type="button"
												className="text-muted-foreground hover:text-destructive"
												onClick={() =>
													updateField(
														'amenities',
														values.amenities.filter((item) => item !== amenity)
													)
												}
											>
												Remove
											</button>
										</li>
									))}
								</ul>
							)}
							<FieldError message={fieldErrors.amenities} />
						</div>
					</div>
				)}

				{step.key === 'extra' && (
					<div className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="extraInfo">Additional information (optional)</Label>
							<Textarea
								id="extraInfo"
								rows={4}
								maxLength={400}
								value={values.extraInfo ?? ''}
								onChange={(event) => updateField('extraInfo', event.target.value)}
							/>
							<FieldError message={fieldErrors.extraInfo} />
						</div>
						<p className="text-sm text-muted-foreground">
							Save as draft keeps the listing private. Submit for review sends it to admin
							moderation.
						</p>
					</div>
				)}

				<FieldError message={formError} />

				<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
					<Button type="button" variant="outline" onClick={goPrev} disabled={stepIndex === 0 || pending}>
						Back
					</Button>
					<div className="flex flex-wrap gap-2">
						<Button type="button" variant="outline" onClick={saveDraft} disabled={pending}>
							{pending ? 'Saving...' : 'Save as draft'}
						</Button>
						{!isLastStep ? (
							<Button type="button" onClick={goNext} disabled={pending}>
								Continue
							</Button>
						) : (
							<Button type="button" onClick={submitForReview} disabled={pending}>
								{pending ? 'Submitting...' : 'Submit for review'}
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function stepCopy(step: PropertyFormStepKey) {
	switch (step) {
		case 'details':
			return 'Name, capacity, price, and timing for your property.';
		case 'location':
			return 'City and address details. Map integration comes later.';
		case 'images':
			return 'Photo uploads are deferred until ImageKit is wired.';
		case 'categories':
			return 'Pick event categories and optional amenities.';
		case 'extra':
			return 'Optional notes, then save as draft or submit for review.';
	}
}
