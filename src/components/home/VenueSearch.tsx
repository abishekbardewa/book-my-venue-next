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

export function VenueSearch({ className }: { className?: string }) {
	const [city, setCity] = useState('all');
	const [query, setQuery] = useState('');

	return (
		<form
			className={cn(
				'home-search flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-card p-2 shadow-lg ring-1 ring-border/80 sm:flex-row sm:items-center sm:rounded-full sm:p-1.5',
				className
			)}
			onSubmit={(event) => {
				event.preventDefault();
			}}
		>
			<label className="sr-only" htmlFor="home-city">
				City
			</label>
			<Select value={city} onValueChange={setCity}>
				<SelectTrigger
					id="home-city"
					className="h-11 w-full border-0 bg-transparent shadow-none focus-visible:ring-2 sm:w-44"
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
			<div className="hidden h-8 w-px bg-border sm:block" aria-hidden />
			<label className="sr-only" htmlFor="home-query">
				Search venues
			</label>
			<div className="relative min-w-0 flex-1">
				<Search
					className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden
				/>
				<input
					id="home-query"
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search venues..."
					className="h-11 w-full rounded-full border-0 bg-transparent pr-4 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>
		</form>
	);
}
