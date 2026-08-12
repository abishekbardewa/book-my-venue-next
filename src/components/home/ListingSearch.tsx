'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { PROPERTY_CITIES } from '@/features/properties/constants';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function ListingSearch({ className }: { className?: string }) {
	const [city, setCity] = useState('all');
	const [query, setQuery] = useState('');

	return (
		<form
			className={cn(
				'home-search flex w-full flex-col gap-2 overflow-hidden rounded-2xl bg-card p-2 shadow-[0_8px_28px_rgba(31,42,46,0.08)] ring-1 ring-black/5 sm:h-[68px] sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-full sm:p-0 sm:pl-3',
				'has-[#home-query:focus]:[&_[data-search-divider]]:opacity-0',
				className
			)}
			onSubmit={(event) => {
				event.preventDefault();
			}}
		>
			<label className="sr-only" htmlFor="home-city">
				City
			</label>
			<div className="flex items-center sm:shrink-0">
				<Select value={city} onValueChange={setCity}>
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
			<div className="flex min-w-0 flex-1 items-stretch transition-colors focus-within:bg-secondary/60">
				<input
					id="home-query"
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search venues..."
					className="h-12 min-w-0 w-full border-0 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0 sm:h-auto sm:self-stretch"
				/>
				<div className="flex items-center p-2">
					<button
						type="submit"
						aria-label="Search venues"
						className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:size-12 sm:rounded-full sm:gap-0"
					>
						<Search className="size-5" aria-hidden />
						<span className="sm:hidden">Search</span>
					</button>
				</div>
			</div>
		</form>
	);
}
