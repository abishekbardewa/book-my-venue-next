'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed, MapPin, Search, Tags, X } from 'lucide-react';
import { PROPERTY_CATEGORIES, PROPERTY_CITIES } from '@/features/properties/constants';
import type { PublicListing } from '@/features/properties/types';
import { resolveNearbyListingCity } from '@/features/maps/resolveNearbyListingCity';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type ListingSearchProps = {
	className?: string;
	listings?: PublicListing[];
	city?: string;
	category?: string;
	searchQuery: string;
	onCityChange?: (city: string) => void;
	onCategoryChange?: (tag: string) => void;
	onSearchCommit: (query: string) => void;
	variant?: 'default' | 'hero';
	commitMode?: 'live' | 'submit';
	showCity?: boolean;
	showCategory?: boolean;
	showSuggestions?: boolean;
};

function uniqueNames(listings: PublicListing[], city: string, input: string) {
	const needle = input.trim().toLowerCase();
	if (!needle) return [];

	const names = new Set<string>();
	for (const listing of listings) {
		if (city !== 'all' && listing.city !== city) continue;
		if (!listing.propertyName.toLowerCase().includes(needle)) continue;
		names.add(listing.propertyName);
		if (names.size >= 10) break;
	}
	return [...names];
}

export function ListingSearch({
	className,
	listings = [],
	city = 'all',
	category = '',
	searchQuery,
	onCityChange,
	onCategoryChange,
	onSearchCommit,
	variant = 'default',
	commitMode = 'live',
	showCity = true,
	showCategory = false,
	showSuggestions = true,
}: ListingSearchProps) {
	const [inputValue, setInputValue] = useState(searchQuery);
	const [debouncedInput, setDebouncedInput] = useState(searchQuery);
	const [open, setOpen] = useState(false);
	const [cityOpen, setCityOpen] = useState(false);
	const [locating, setLocating] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const rootRef = useRef<HTMLDivElement>(null);
	const isHero = variant === 'hero';

	useEffect(() => {
		setInputValue(searchQuery);
		setDebouncedInput(searchQuery);
	}, [searchQuery]);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedInput(inputValue);
		}, 500);
		return () => window.clearTimeout(timer);
	}, [inputValue]);

	useEffect(() => {
		if (commitMode !== 'live') return;
		onSearchCommit(debouncedInput.trim());
	}, [commitMode, debouncedInput, onSearchCommit]);

	const suggestions = useMemo(
		() => (showSuggestions ? uniqueNames(listings, city, debouncedInput) : []),
		[listings, city, debouncedInput, showSuggestions],
	);

	useEffect(() => {
		setHighlightedIndex(-1);
	}, [suggestions]);

	useEffect(() => {
		function handlePointerDown(event: MouseEvent) {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener('mousedown', handlePointerDown);
		return () => document.removeEventListener('mousedown', handlePointerDown);
	}, []);

	function commitSearch(query: string) {
		const next = query.trim();
		setInputValue(next);
		setDebouncedInput(next);
		setOpen(false);
		onSearchCommit(next);
	}

	function handleCityChange(nextCity: string) {
		setInputValue('');
		setDebouncedInput('');
		setOpen(false);
		onCityChange?.(nextCity);
	}

	async function handleUseMyLocation() {
		setLocating(true);
		try {
			const matched = await resolveNearbyListingCity();
			if (!matched) return;
			setCityOpen(false);
			setInputValue('');
			setDebouncedInput('');
			setOpen(false);
			onCityChange?.(matched);
		} finally {
			setLocating(false);
		}
	}

	function clearSearch() {
		setInputValue('');
		setDebouncedInput('');
		setOpen(false);
		onSearchCommit('');
	}

	function highlightText(text: string, highlight: string) {
		const index = text.toLowerCase().indexOf(highlight.toLowerCase());
		if (index === -1) return text;

		return (
			<>
				{text.slice(0, index)}
				<span className="font-semibold text-foreground">{text.slice(index, index + highlight.length)}</span>
				{text.slice(index + highlight.length)}
			</>
		);
	}

	const isLoading = commitMode === 'live' && inputValue !== debouncedInput;
	const hasQuery = inputValue.trim().length > 0;
	const showMenu = showSuggestions && open && debouncedInput.trim().length > 0;

	return (
		<div ref={rootRef} className={cn('w-full', className)}>
			<form
				className={cn(
					'relative z-20 flex w-full flex-col overflow-visible sm:flex-row sm:items-stretch',
					isHero
						? 'border border-white/40 bg-card/70 p-1.5 shadow-sm backdrop-blur-md sm:rounded-none'
						: 'border border-structural-border bg-background',
				)}
				onSubmit={(event) => {
					event.preventDefault();
					commitSearch(inputValue);
				}}
			>
				{showCity ? (
					<>
						<label className="sr-only" htmlFor="listings-city">
							City
						</label>
						<div
							className={cn(
								'flex items-center gap-3 px-4 py-3 sm:min-w-[180px] sm:shrink-0',
								'border-b border-structural-border sm:border-r sm:border-b-0',
							)}
						>
							<MapPin className="size-5 shrink-0 text-primary" aria-hidden />
							<div className="min-w-0 flex-1 text-left">
								<Select value={city} open={cityOpen} onOpenChange={setCityOpen} onValueChange={handleCityChange}>
									<SelectTrigger
										id="listings-city"
										className="h-auto w-full rounded-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 [&>svg]:opacity-70"
									>
										<SelectValue placeholder="City" />
									</SelectTrigger>
									<SelectContent align="start" className="rounded-none">
										<button
											type="button"
											disabled={locating}
											onClick={(event) => {
												event.preventDefault();
												void handleUseMyLocation();
											}}
											className="flex w-full items-center gap-2 px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
										>
											<LocateFixed className="size-4 shrink-0 text-primary" aria-hidden />
											{locating ? 'Locating…' : 'Use my location'}
										</button>
										<SelectSeparator />
										<SelectItem value="all">All Cities</SelectItem>
										{PROPERTY_CITIES.map((name) => (
											<SelectItem key={name} value={name}>
												{name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</>
				) : null}

				{showCategory ? (
					<>
						<label className="sr-only" htmlFor="listings-category">
							Category
						</label>
						<div
							className={cn(
								'flex items-center gap-3 px-4 py-3 sm:min-w-[180px] sm:shrink-0',
								'border-b border-structural-border sm:border-r sm:border-b-0',
							)}
						>
							<Tags className="size-5 shrink-0 text-primary" aria-hidden />
							<div className="min-w-0 flex-1 text-left">
								<Select
									value={category || 'all'}
									onValueChange={(value) => {
										onCategoryChange?.(value === 'all' ? '' : value);
									}}
								>
									<SelectTrigger
										id="listings-category"
										className="h-auto w-full rounded-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 [&>svg]:opacity-70"
									>
										<SelectValue placeholder="Category" />
									</SelectTrigger>
									<SelectContent align="start" className="rounded-none">
										<SelectItem value="all">All Categories</SelectItem>
										{PROPERTY_CATEGORIES.map((item) => (
											<SelectItem key={item.tagName} value={item.tagName}>
												{item.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</>
				) : null}

				<label className="sr-only" htmlFor="listings-query">
					Search venues
				</label>
				<div className="relative flex min-w-0 flex-1 items-stretch">
					<div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left">
						{showCity || showCategory ? <Search className="size-5 shrink-0 text-primary" aria-hidden /> : null}
						<div className="min-w-0 flex-1">
							<input
								id="listings-query"
								type="text"
								value={inputValue}
								autoComplete="off"
								role={showSuggestions ? 'combobox' : undefined}
								aria-expanded={showSuggestions ? showMenu : undefined}
								aria-controls={showSuggestions ? 'listings-search-suggestions' : undefined}
								aria-autocomplete={showSuggestions ? 'list' : undefined}
								onChange={(event) => {
									setInputValue(event.target.value);
									if (showSuggestions) setOpen(true);
								}}
								onFocus={() => {
									if (showSuggestions) setOpen(true);
								}}
								onKeyDown={(event) => {
									if (!showMenu) return;
									if (event.key === 'ArrowDown') {
										event.preventDefault();
										setHighlightedIndex((index) => (index < suggestions.length - 1 ? index + 1 : 0));
										return;
									}
									if (event.key === 'ArrowUp') {
										event.preventDefault();
										setHighlightedIndex((index) => (index > 0 ? index - 1 : suggestions.length - 1));
										return;
									}
									if (event.key === 'Enter' && highlightedIndex >= 0) {
										event.preventDefault();
										commitSearch(suggestions[highlightedIndex] ?? inputValue);
										return;
									}
									if (event.key === 'Escape') {
										setOpen(false);
									}
								}}
								placeholder="Search venues..."
								className="w-full border-0 bg-transparent p-0 text-sm text-foreground outline-none placeholder:text-muted-foreground"
							/>
						</div>
						{isLoading ? (
							<span className="search-loader-dots text-muted-foreground" aria-label="Searching" role="status">
								<span />
								<span />
								<span />
							</span>
						) : hasQuery ? (
							<button type="button" aria-label="Clear search" onClick={clearSearch} className="text-muted-foreground hover:text-foreground">
								<X className="size-4" aria-hidden />
							</button>
						) : null}
					</div>

					<button
						type="submit"
						aria-label="Search venues"
						className={cn(
							'inline-flex shrink-0 items-center justify-center gap-2 bg-primary px-5 font-semibold tracking-[0.1em] text-primary-foreground uppercase transition-colors hover:bg-primary/90',
							isHero ? 'min-h-[56px] sm:min-w-[56px]' : 'min-h-12 sm:min-w-12',
						)}
					>
						<Search className="size-5" aria-hidden />
						<span className="sm:hidden">Search</span>
					</button>

					{showMenu ? (
						<ul
							id="listings-search-suggestions"
							role="listbox"
							className="absolute top-[calc(100%+0.35rem)] right-0 left-0 z-50 max-h-60 overflow-y-auto border border-structural-border bg-card py-1 text-left text-sm"
						>
							{suggestions.length === 0 ? (
								<li className="px-3 py-2 text-muted-foreground">No results found</li>
							) : (
								suggestions.map((name, index) => (
									<li key={name} role="option" aria-selected={highlightedIndex === index}>
										<button
											type="button"
											className={cn('w-full px-3 py-2 text-left text-muted-foreground', highlightedIndex === index && 'bg-secondary text-foreground')}
											onMouseEnter={() => setHighlightedIndex(index)}
											onMouseDown={(event) => event.preventDefault()}
											onClick={() => commitSearch(name)}
										>
											{highlightText(name, debouncedInput.trim())}
										</button>
									</li>
								))
							)}
						</ul>
					) : null}
				</div>
			</form>
		</div>
	);
}
