'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { PROPERTY_CITIES } from '@/features/properties/constants';
import type { PublicListing } from '@/features/properties/types';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type ListingSearchProps = {
	className?: string;
	listings: PublicListing[];
	city: string;
	searchQuery: string;
	onCityChange: (city: string) => void;
	onSearchCommit: (query: string) => void;
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
	listings,
	city,
	searchQuery,
	onCityChange,
	onSearchCommit,
}: ListingSearchProps) {
	const [inputValue, setInputValue] = useState(searchQuery);
	const [debouncedInput, setDebouncedInput] = useState(searchQuery);
	const [open, setOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Parent clears search (e.g. city change) — don't overwrite mid-typing on live commits
		if (searchQuery === '') {
			setInputValue('');
			setDebouncedInput('');
		}
	}, [searchQuery]);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedInput(inputValue);
		}, 500);
		return () => window.clearTimeout(timer);
	}, [inputValue]);

	useEffect(() => {
		onSearchCommit(debouncedInput.trim());
	}, [debouncedInput, onSearchCommit]);

	const suggestions = useMemo(
		() => uniqueNames(listings, city, debouncedInput),
		[listings, city, debouncedInput]
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
		onCityChange(nextCity);
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
				<span className="font-semibold text-foreground">
					{text.slice(index, index + highlight.length)}
				</span>
				{text.slice(index + highlight.length)}
			</>
		);
	}

	const isLoading = inputValue !== debouncedInput;
	const hasSettledQuery = !isLoading && debouncedInput.trim().length > 0;
	const showMenu = open && debouncedInput.trim().length > 0;

	return (
		<div ref={rootRef} className={cn('w-full', className)}>
			<form
				className={cn(
					'home-search relative z-20 flex w-full flex-col gap-2 overflow-visible rounded-2xl bg-card p-2 shadow-[0_8px_28px_rgba(31,42,46,0.08)] ring-1 ring-black/5 sm:h-[68px] sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-full sm:p-0 sm:pl-3',
					'has-[#home-query:focus]:[&_[data-search-divider]]:opacity-0'
				)}
				onSubmit={(event) => {
					event.preventDefault();
					commitSearch(inputValue);
				}}
			>
				<label className="sr-only" htmlFor="home-city">
					City
				</label>
				<div className="flex items-center sm:shrink-0">
					<Select value={city} onValueChange={handleCityChange}>
						<SelectTrigger
							id="home-city"
							className="h-12 w-full border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0 sm:h-full sm:w-48"
						>
							<SelectValue placeholder="All Cities" />
						</SelectTrigger>
						<SelectContent align="start" className="rounded-xl">
							<SelectItem value="all">All Cities</SelectItem>
							{PROPERTY_CITIES.map((name) => (
								<SelectItem key={name} value={name}>
									{name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div
					data-search-divider
					className="hidden w-px self-center bg-border transition-opacity sm:block sm:h-10"
					aria-hidden
				/>
				<label className="sr-only" htmlFor="home-query">
					Search venues
				</label>
				<div className="relative flex min-w-0 flex-1 items-stretch transition-colors focus-within:bg-secondary/60">
					<input
						id="home-query"
						type="text"
						value={inputValue}
						autoComplete="off"
						role="combobox"
						aria-expanded={showMenu}
						aria-controls="home-search-suggestions"
						aria-autocomplete="list"
						onChange={(event) => {
							setInputValue(event.target.value);
							setOpen(true);
						}}
						onFocus={() => setOpen(true)}
						onKeyDown={(event) => {
							if (!showMenu) return;

							if (event.key === 'ArrowDown') {
								event.preventDefault();
								setHighlightedIndex((index) =>
									index < suggestions.length - 1 ? index + 1 : 0
								);
								return;
							}
							if (event.key === 'ArrowUp') {
								event.preventDefault();
								setHighlightedIndex((index) =>
									index > 0 ? index - 1 : suggestions.length - 1
								);
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
						className="h-12 min-w-0 w-full border-0 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0 sm:h-auto sm:self-stretch"
					/>
					<div className="flex items-center pr-3 sm:pr-4">
						{isLoading ? (
							<span
								className="search-loader-dots inline-flex size-5 items-center justify-center text-muted-foreground"
								aria-label="Searching"
								role="status"
							>
								<span />
								<span />
								<span />
							</span>
						) : hasSettledQuery ? (
							<button
								type="button"
								aria-label="Clear search"
								onClick={clearSearch}
								className="inline-flex size-5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
							>
								<X className="size-5" aria-hidden strokeWidth={2} />
							</button>
						) : (
							<button
								type="submit"
								aria-label="Search venues"
								className="inline-flex size-5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
							>
								<Search className="size-5" aria-hidden strokeWidth={2} />
							</button>
						)}
					</div>

					{showMenu ? (
						<ul
							id="home-search-suggestions"
							role="listbox"
							className="absolute top-[calc(100%+0.35rem)] right-0 left-0 z-50 max-h-60 overflow-y-auto rounded-xl border border-border bg-card py-1 text-sm shadow-lg"
						>
							{suggestions.length === 0 ? (
								<li className="px-3 py-2 text-muted-foreground">No results found</li>
							) : (
								suggestions.map((name, index) => (
									<li key={name} role="option" aria-selected={highlightedIndex === index}>
										<button
											type="button"
											className={cn(
												'w-full px-3 py-2 text-left text-muted-foreground',
												highlightedIndex === index && 'bg-secondary text-foreground'
											)}
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
