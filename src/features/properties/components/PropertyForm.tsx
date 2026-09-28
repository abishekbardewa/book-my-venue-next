'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { LocationPicker } from '@/features/maps/components/LocationPicker';
import {
	savePropertyDraftAction,
	submitPropertyForReviewAction,
} from '@/features/properties/actions';
import {
	PROPERTY_CATEGORIES,
	PROPERTY_CITIES,
	PROPERTY_FORM_STEPS,
	SUGGESTED_AMENITIES,
	type PropertyFormStepKey,
} from '@/features/properties/constants';
import { canResubmitRejectedListing } from '@/features/properties/rejectionReasons';
import type { PropertyFormValues } from '@/features/properties/schemas';
import {
	PropertyImagesField,
	type LocalPropertyImage,
} from '@/features/properties/components/PropertyImagesField';
import {
	IMAGEKIT_FOLDERS,
	PROPERTY_IMAGE_MAX_PX,
} from '@/features/uploads/constants';
import { uploadFileToImageKit } from '@/features/uploads/uploadClient';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatInr } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
	fieldClassName,
	selectFieldClassName,
	textareaFieldClassName,
} from '@/components/ui/fieldStyles';

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
	lat: '',
	lng: '',
	extraInfo: '',
	tags: [],
	amenities: [],
	images: [],
};

type ListingFormMeta = {
	listingStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | null;
	listingRejectionReason: string | null;
	listingAllowsResubmit: boolean | null;
	listingSubmissionCount: number;
};

type PropertyFormProps = {
	initialValues?: Omit<Partial<PropertyFormValues>, 'images'> & {
		id?: string;
		images?: LocalPropertyImage[];
	};
	listingMeta?: ListingFormMeta;
};

export function PropertyForm({ initialValues, listingMeta }: PropertyFormProps) {
	const router = useRouter();
	const [stepIndex, setStepIndex] = useState(0);
	const [values, setValues] = useState<PropertyFormValues>({
		...emptyValues,
		...initialValues,
		tags: initialValues?.tags ?? [],
		amenities: initialValues?.amenities ?? [],
		images:
			initialValues?.images?.map((image) => ({
				imgUrl: image.imgUrl ?? image.previewUrl,
				imagekitFileId: image.imagekitFileId ?? '',
				caption: image.caption,
			})) ?? [],
		id: initialValues?.id,
	});
	const [localImages, setLocalImages] = useState<LocalPropertyImage[]>(
		initialValues?.images ?? []
	);
	const [amenityDraft, setAmenityDraft] = useState('');
	const [termsChecked, setTermsChecked] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
	const [formError, setFormError] = useState<string | undefined>();
	const [pending, startTransition] = useTransition();

	const step = PROPERTY_FORM_STEPS[stepIndex]!;
	const isLastStep = stepIndex === PROPERTY_FORM_STEPS.length - 1;
	const progress = ((stepIndex + 1) / PROPERTY_FORM_STEPS.length) * 100;
	const isRejected = listingMeta?.listingStatus === 'REJECTED';
	const canResubmit =
		!isRejected || canResubmitRejectedListing(listingMeta?.listingAllowsResubmit ?? null);
	const isResubmit = isRejected && canResubmit;

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

	function toggleSuggestedAmenity(name: string) {
		setValues((prev) => {
			if (prev.amenities.includes(name)) {
				return {
					...prev,
					amenities: prev.amenities.filter((amenity) => amenity !== name),
				};
			}
			if (prev.amenities.length >= 5) {
				toast.error('You can add up to 5 amenities');
				return prev;
			}
			return { ...prev, amenities: [...prev.amenities, name] };
		});
	}

	function addAmenity() {
		const next = amenityDraft.trim();
		if (!next) return;
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
			setFieldErrors({ propertyName: 'Venue name is required' });
			return;
		}
		setFieldErrors({});
		setStepIndex((index) => Math.min(index + 1, PROPERTY_FORM_STEPS.length - 1));
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function goPrev() {
		setFieldErrors({});
		setStepIndex((index) => Math.max(index - 1, 0));
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function goToStep(key: PropertyFormStepKey) {
		const index = PROPERTY_FORM_STEPS.findIndex((item) => item.key === key);
		if (index >= 0) {
			setStepIndex(index);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	async function persistImages() {
		const uploaded: PropertyFormValues['images'] = [];
		const nextLocal: LocalPropertyImage[] = [];
		for (const image of localImages) {
			if (image.imgUrl && image.imagekitFileId && !image.file) {
				uploaded.push({
					imgUrl: image.imgUrl,
					imagekitFileId: image.imagekitFileId,
					caption: image.caption || undefined,
				});
				nextLocal.push(image);
				continue;
			}
			if (!image.file) continue;
			const result = await uploadFileToImageKit({
				file: image.file,
				folder: IMAGEKIT_FOLDERS.properties,
				maxPx: PROPERTY_IMAGE_MAX_PX,
			});
			if (image.file) {
				URL.revokeObjectURL(image.previewUrl);
			}
			const saved: LocalPropertyImage = {
				key: image.key,
				previewUrl: result.url,
				imgUrl: result.url,
				imagekitFileId: result.fileId,
				caption: image.caption,
			};
			uploaded.push({
				imgUrl: result.url,
				imagekitFileId: result.fileId,
				caption: image.caption || undefined,
			});
			nextLocal.push(saved);
		}
		setLocalImages(nextLocal);
		return uploaded;
	}

	function saveDraft() {
		setFormError(undefined);
		setFieldErrors({});
		startTransition(async () => {
			try {
				const images = await persistImages();
				const result = await savePropertyDraftAction({ ...values, images });
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
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Could not upload photos';
				setFormError(message);
				toast.error(message);
			}
		});
	}

	function submitForReview() {
		if (!canResubmit) {
			toast.error('This listing was permanently rejected and cannot be resubmitted');
			return;
		}
		if (!termsChecked) {
			toast.error('Confirm the listing details before submitting');
			return;
		}
		setFormError(undefined);
		setFieldErrors({});
		startTransition(async () => {
			try {
				const images = await persistImages();
				const result = await submitPropertyForReviewAction({ ...values, images });
				if (result?.fieldErrors) {
					setFieldErrors(result.fieldErrors);
					toast.error('Fix the highlighted fields before submitting');
					return;
				}
				if (result?.error) {
					setFormError(result.error);
					toast.error(result.error);
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Could not upload photos';
				setFormError(message);
				toast.error(message);
			}
		});
	}

	const categoryLabels = values.tags.map(
		(tag) => PROPERTY_CATEGORIES.find((item) => item.tagName === tag)?.label ?? tag
	);

	return (
		<div className="mx-auto w-full max-w-6xl">
			<div className="mb-8 flex items-center justify-between gap-4 border-b border-structural-border pb-4">
				<button
					type="button"
					onClick={() => router.push('/owner')}
					className="label-caps inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="size-4" aria-hidden />
					Exit Setup
				</button>
				<button
					type="button"
					onClick={saveDraft}
					disabled={pending}
					className="label-caps border border-primary px-4 py-2.5 text-ink transition-colors hover:bg-secondary disabled:opacity-60"
				>
					{pending ? 'Saving…' : 'Save & Exit'}
				</button>
			</div>

			<div className="mb-10">
				<div className="mb-2 flex items-center justify-between gap-3">
					<span className="label-caps text-ink">
						Step {stepIndex + 1} of {PROPERTY_FORM_STEPS.length}
					</span>
					<span className="label-caps text-muted-foreground">{step.shortLabel}</span>
				</div>
				<div className="h-1 w-full bg-structural-border">
					<div
						className="h-full bg-primary transition-all duration-500"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			{isRejected ? (
				<div
					className={cn(
						'mb-8 border border-l-4 p-4',
						canResubmit
							? 'border-destructive/40 border-l-destructive bg-destructive/5'
							: 'border-structural-border border-l-muted-foreground bg-secondary/60'
					)}
				>
					<p className="label-caps mb-1 text-destructive">
						{canResubmit ? 'Rejected — fix and resubmit' : 'Permanently rejected'}
					</p>
					{listingMeta?.listingRejectionReason ? (
						<p className="text-sm text-foreground">{listingMeta.listingRejectionReason}</p>
					) : null}
					{!canResubmit ? (
						<p className="mt-2 text-sm text-muted-foreground">
							This listing cannot be submitted again. You can archive it from your
							listings.
						</p>
					) : (
						<p className="mt-2 text-sm text-muted-foreground">
							Update the listing to address the feedback, then resubmit for review.
						</p>
					)}
				</div>
			) : null}

			{step.key !== 'images' ? (
				<header className="mb-8 max-w-3xl">
					<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
						{stepHeadline(step.key)}
					</h1>
					<p className="mt-2 text-muted-foreground sm:text-lg">{stepCopy(step.key)}</p>
				</header>
			) : (
				<header className="mb-8 lg:hidden">
					<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
						{stepHeadline(step.key)}
					</h1>
					<p className="mt-2 text-muted-foreground sm:text-lg">{stepCopy(step.key)}</p>
				</header>
			)}

			<div className="space-y-8">
				{step.key === 'details' && (
					<div className="max-w-3xl space-y-8">
						<div className="space-y-2">
							<Label htmlFor="propertyName" className="label-caps tracking-widest">
								Venue Name
							</Label>
							<Input
								id="propertyName"
								placeholder="e.g. The Glasshouse Studio"
								value={values.propertyName}
								onChange={(event) => updateField('propertyName', event.target.value)}
								className={fieldClassName}
							/>
							<FieldError message={fieldErrors.propertyName} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="description" className="label-caps tracking-widest">
								Description
							</Label>
							<Textarea
								id="description"
								rows={4}
								maxLength={600}
								placeholder="Describe the atmosphere, unique features, and vibe of your space..."
								value={values.description ?? ''}
								onChange={(event) => updateField('description', event.target.value)}
								className={textareaFieldClassName}
							/>
							<FieldError message={fieldErrors.description} />
						</div>
						<div className="grid gap-8 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="capacity" className="label-caps tracking-widest">
									Guest Capacity
								</Label>
								<Input
									id="capacity"
									placeholder="e.g. 50"
									value={values.capacity ?? ''}
									onChange={(event) => updateField('capacity', event.target.value)}
									className={fieldClassName}
								/>
								<FieldError message={fieldErrors.capacity} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="price" className="label-caps tracking-widest">
									Price per Day (INR)
								</Label>
								<div className="relative">
									<span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 font-headline text-lg text-muted-foreground">
										₹
									</span>
									<Input
										id="price"
										placeholder="0"
										value={values.price ?? ''}
										onChange={(event) => updateField('price', event.target.value)}
										className={cn(fieldClassName, 'pl-8')}
									/>
								</div>
								<FieldError message={fieldErrors.price} />
							</div>
						</div>
						<div className="grid gap-8 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="checkInTime" className="label-caps tracking-widest">
									Access from
								</Label>
								<Input
									id="checkInTime"
									type="time"
									value={values.checkInTime ?? ''}
									onChange={(event) => updateField('checkInTime', event.target.value)}
									className={fieldClassName}
								/>
								<FieldError message={fieldErrors.checkInTime} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="checkOutTime" className="label-caps tracking-widest">
									Access until
								</Label>
								<Input
									id="checkOutTime"
									type="time"
									value={values.checkOutTime ?? ''}
									onChange={(event) => updateField('checkOutTime', event.target.value)}
									className={fieldClassName}
								/>
								<FieldError message={fieldErrors.checkOutTime} />
							</div>
						</div>
					</div>
				)}

				{step.key === 'location' && (
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
						<div className="space-y-6 lg:col-span-4">
							<div className="space-y-2">
								<Label htmlFor="city" className="label-caps tracking-widest">
									City
								</Label>
								<select
									id="city"
									value={values.city ?? ''}
									onChange={(event) => updateField('city', event.target.value)}
									className={selectFieldClassName}
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
							<div className="space-y-2">
								<Label htmlFor="address" className="label-caps tracking-widest">
									Full Address
								</Label>
								<Textarea
									id="address"
									rows={3}
									maxLength={300}
									value={values.address ?? ''}
									onChange={(event) => updateField('address', event.target.value)}
									className={cn(textareaFieldClassName, 'min-h-24')}
								/>
								<FieldError message={fieldErrors.address} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="pincode" className="label-caps tracking-widest">
									Pin Code
								</Label>
								<Input
									id="pincode"
									value={values.pincode ?? ''}
									onChange={(event) => updateField('pincode', event.target.value)}
									className={fieldClassName}
								/>
								<FieldError message={fieldErrors.pincode} />
							</div>
							{(values.address || values.city) && (
								<div className="border border-structural-border bg-secondary/40 p-5">
									<p className="label-caps mb-3 text-muted-foreground">Selected Location</p>
									<p className="font-semibold text-foreground">
										{values.address || 'Address pending'}
									</p>
									<p className="mt-1 text-sm text-muted-foreground">
										{[values.city, values.pincode, values.country]
											.filter(Boolean)
											.join(', ')}
									</p>
								</div>
							)}
						</div>
						<div className="lg:col-span-8">
							<LocationPicker
								lat={values.lat}
								lng={values.lng}
								mapClassName="relative z-0 h-[320px] overflow-hidden rounded-none border border-structural-border lg:h-[520px]"
								onChange={(next) => {
									setValues((prev) => ({
										...prev,
										lat: next.lat,
										lng: next.lng,
										address: next.address ?? prev.address,
										city: next.city ?? prev.city,
										country: next.country ?? prev.country,
										pincode: next.pincode ?? prev.pincode,
									}));
								}}
							/>
						</div>
					</div>
				)}

				{step.key === 'images' && (
					<div>
						<div className="mb-8 hidden max-w-3xl lg:block">
							<h1 className="font-headline text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
								{stepHeadline('images')}
							</h1>
							<p className="mt-3 text-muted-foreground sm:text-lg">{stepCopy('images')}</p>
						</div>
						<PropertyImagesField
							images={localImages}
							onChange={setLocalImages}
							disabled={pending}
						/>
					</div>
				)}

				{step.key === 'categories' && (
					<div className="max-w-4xl space-y-12">
						<section>
							<h2 className="font-headline text-2xl font-semibold text-foreground">
								Venue Categories
							</h2>
							<p className="mt-2 text-muted-foreground">Select up to 3 that apply.</p>
							<div className="mt-6 flex flex-wrap gap-3">
								{PROPERTY_CATEGORIES.map((category) => {
									const selected = values.tags.includes(category.tagName);
									return (
										<button
											key={category.tagName}
											type="button"
											onClick={() => toggleTag(category.tagName)}
											className={cn(
												'border px-6 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors',
												selected
													? 'border-primary bg-primary text-primary-foreground'
													: 'border-structural-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground'
											)}
										>
											{category.label}
										</button>
									);
								})}
							</div>
							<FieldError message={fieldErrors.tags} />
						</section>

						<section>
							<h2 className="font-headline text-2xl font-semibold text-foreground">Amenities</h2>
							<p className="mt-2 text-muted-foreground">
								What facilities are included? Pick suggestions or add your own (max 5).
							</p>
							<div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
								{SUGGESTED_AMENITIES.map((amenity) => {
									const selected = values.amenities.includes(amenity);
									return (
										<button
											key={amenity}
											type="button"
											onClick={() => toggleSuggestedAmenity(amenity)}
											className={cn(
												'border p-5 text-center text-xs font-semibold tracking-widest uppercase transition-colors',
												selected
													? 'border-primary bg-secondary text-foreground'
													: 'border-structural-border bg-card text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
											)}
										>
											{amenity}
										</button>
									);
								})}
							</div>
							<div className="mt-6 flex gap-2">
								<Input
									id="amenity"
									value={amenityDraft}
									onChange={(event) => setAmenityDraft(event.target.value)}
									placeholder="Add custom amenity"
									className={cn(fieldClassName, 'flex-1')}
									onKeyDown={(event) => {
										if (event.key === 'Enter') {
											event.preventDefault();
											addAmenity();
										}
									}}
								/>
								<Button type="button" variant="outline" onClick={addAmenity}>
									Add
								</Button>
							</div>
							{values.amenities.length > 0 ? (
								<ul className="mt-4 flex flex-wrap gap-2">
									{values.amenities.map((amenity) => (
										<li
											key={amenity}
											className="inline-flex items-center gap-2 border border-structural-border bg-secondary/40 px-3 py-1.5 text-sm"
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
												×
											</button>
										</li>
									))}
								</ul>
							) : null}
							<FieldError message={fieldErrors.amenities} />
						</section>
					</div>
				)}

				{step.key === 'extra' && (
					<section className="max-w-3xl border border-structural-border bg-card p-6 sm:p-8">
						<div className="mb-6 border-b border-structural-border pb-4">
							<h2 className="font-headline text-2xl font-semibold text-foreground">
								Venue Policies
							</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								Share rules and notes bookers should know before booking. Platform cancellation
								terms still apply.
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="extraInfo" className="label-caps tracking-widest">
								General Rules & Restrictions
							</Label>
							<p className="text-xs text-muted-foreground">
								e.g. Noise limits, smoking policy, permitted activities.
							</p>
							<Textarea
								id="extraInfo"
								rows={5}
								maxLength={400}
								placeholder="List any key rules bookers and attendees must follow..."
								value={values.extraInfo ?? ''}
								onChange={(event) => updateField('extraInfo', event.target.value)}
								className={cn(textareaFieldClassName, 'mt-2 min-h-32')}
							/>
							<FieldError message={fieldErrors.extraInfo} />
						</div>
					</section>
				)}

				{step.key === 'review' && (
					<div className="mx-auto max-w-3xl space-y-6">
						<ReviewSection title="Venue Details" onEdit={() => goToStep('details')}>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<p className="label-caps mb-1 text-muted-foreground">Title</p>
									<p className="text-foreground">{values.propertyName || '—'}</p>
								</div>
								<div>
									<p className="label-caps mb-1 text-muted-foreground">Capacity</p>
									<p className="text-foreground">
										{values.capacity ? `Up to ${values.capacity} guests` : '—'}
									</p>
								</div>
								<div>
									<p className="label-caps mb-1 text-muted-foreground">Price</p>
									<p className="text-foreground">
										{values.price && !Number.isNaN(Number(values.price))
											? `${formatInr(Number(values.price))} / day`
											: '—'}
									</p>
								</div>
								<div>
									<p className="label-caps mb-1 text-muted-foreground">Access</p>
									<p className="text-foreground">
										{values.checkInTime || '—'} – {values.checkOutTime || '—'}
									</p>
								</div>
								<div className="sm:col-span-2">
									<p className="label-caps mb-1 text-muted-foreground">Description</p>
									<p className="text-foreground/80">{values.description || '—'}</p>
								</div>
							</div>
						</ReviewSection>

						<ReviewSection title="Location" onEdit={() => goToStep('location')}>
							<p className="text-foreground">{values.address || '—'}</p>
							<p className="text-muted-foreground">
								{[values.city, values.pincode, values.country].filter(Boolean).join(', ') ||
									'—'}
							</p>
						</ReviewSection>

						<ReviewSection title="Images" onEdit={() => goToStep('images')}>
							{localImages.length === 0 ? (
								<p className="text-muted-foreground">No photos added yet.</p>
							) : (
								<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
									{localImages.slice(0, 3).map((image) => (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											key={image.key}
											src={image.previewUrl}
											alt=""
											className="aspect-square w-full border border-structural-border object-cover"
										/>
									))}
									{localImages.length > 3 ? (
										<div className="flex aspect-square items-center justify-center border border-structural-border bg-secondary/50 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
											+{localImages.length - 3} More
										</div>
									) : null}
								</div>
							)}
						</ReviewSection>

						<ReviewSection
							title="Categories & Amenities"
							onEdit={() => goToStep('categories')}
						>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<p className="label-caps mb-2 text-muted-foreground">Categories</p>
									<div className="flex flex-wrap gap-2">
										{categoryLabels.length > 0 ? (
											categoryLabels.map((label) => (
												<span
													key={label}
													className="border border-structural-border bg-secondary/40 px-2 py-1 text-[10px] font-semibold tracking-widest uppercase"
												>
													{label}
												</span>
											))
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</div>
								</div>
								<div>
									<p className="label-caps mb-2 text-muted-foreground">Amenities</p>
									<p className="text-foreground">
										{values.amenities.length > 0 ? values.amenities.join(', ') : '—'}
									</p>
								</div>
							</div>
						</ReviewSection>

						{values.extraInfo ? (
							<ReviewSection title="Additional Info" onEdit={() => goToStep('extra')}>
								<p className="whitespace-pre-wrap text-foreground/80">{values.extraInfo}</p>
							</ReviewSection>
						) : null}

						<label className="flex cursor-pointer items-start gap-3">
							<span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
								<input
									type="checkbox"
									checked={termsChecked}
									onChange={(event) => setTermsChecked(event.target.checked)}
									className={cn(
										'peer size-5 appearance-none border border-input bg-transparent transition-colors',
										'checked:border-primary checked:bg-primary'
									)}
								/>
								<svg
									viewBox="0 0 16 16"
									className="pointer-events-none absolute size-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
									aria-hidden
								>
									<path
										fill="currentColor"
										d="M6.5 11.2 3.3 8l1.1-1.1 2.1 2.1 4.6-4.6L12.2 5.5 6.5 11.2Z"
									/>
								</svg>
							</span>
							<span className="text-sm leading-relaxed text-muted-foreground">
								I confirm that the details provided are accurate and I agree to the{' '}
								<Link
									href="/terms-of-service"
									className="text-ink underline underline-offset-4"
								>
									Terms of Service
								</Link>
								.
							</span>
						</label>
					</div>
				)}

				<FieldError message={formError} />

				<div className="mt-4 flex items-center justify-between gap-4 border-t border-structural-border pt-6">
					<button
						type="button"
						onClick={goPrev}
						disabled={stepIndex === 0 || pending}
						className="label-caps inline-flex items-center gap-2 border border-transparent px-4 py-3 text-foreground transition-colors hover:border-structural-border hover:text-foreground disabled:opacity-40"
					>
						<ArrowLeft className="size-4" aria-hidden />
						Back
					</button>
					{!isLastStep ? (
						<Button type="button" size="lg" className="gap-2" onClick={goNext} disabled={pending}>
							{step.key === 'extra' ? 'Continue to Review' : 'Continue'}
							<ArrowRight className="size-4" aria-hidden />
						</Button>
					) : (
						<Button
							type="button"
							size="lg"
							onClick={submitForReview}
							disabled={pending || !termsChecked || !canResubmit}
						>
							{pending
								? 'Submitting…'
								: isResubmit
									? 'Resubmit for Review'
									: 'Submit for Review'}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

function ReviewSection({
	title,
	onEdit,
	children,
}: {
	title: string;
	onEdit: () => void;
	children: React.ReactNode;
}) {
	return (
		<section className="border border-structural-border bg-card p-6">
			<div className="mb-4 flex items-start justify-between gap-3">
				<h2 className="font-headline text-xl font-semibold text-foreground">{title}</h2>
				<button
					type="button"
					onClick={onEdit}
					className="label-caps inline-flex items-center gap-1 text-ink transition-colors hover:text-foreground"
				>
					<Pencil className="size-3.5" aria-hidden />
					Edit
				</button>
			</div>
			{children}
		</section>
	);
}

function stepHeadline(step: PropertyFormStepKey) {
	switch (step) {
		case 'details':
			return 'Property Details';
		case 'location':
			return 'Where is your venue located?';
		case 'images':
			return 'Showcase your space';
		case 'categories':
			return 'Categories & Amenities';
		case 'extra':
			return 'The Finer Details';
		case 'review':
			return 'Review & Submit';
	}
}

function stepCopy(step: PropertyFormStepKey) {
	switch (step) {
		case 'details':
			return 'Tell us the basics about your venue to start attracting the right bookers.';
		case 'location':
			return 'Your exact address will only be shared with confirmed bookers.';
		case 'images':
			return 'High-quality photos are the most important part of your listing. Bookers rely on them to decide if your venue fits their needs.';
		case 'categories':
			return 'Define what makes your space unique to help the right clients find you.';
		case 'extra':
			return 'Provide clear policies and notes for a seamless booking experience.';
		case 'review':
			return 'Please review the details of your listing before submitting for approval.';
	}
}
