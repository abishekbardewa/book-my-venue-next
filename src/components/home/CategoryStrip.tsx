'use client';

import {
	Building2,
	Cake,
	GlassWater,
	Heart,
	Home,
	LayoutGrid,
	Gem,
	PartyPopper,
	Trees,
	Users,
	UtensilsCrossed,
	Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { HOME_BROWSE_CATEGORIES } from '@/features/properties/constants';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
	all: LayoutGrid,
	wedding: Heart,
	birthday: Cake,
	engagement: Gem,
	'pool-party': Waves,
	'cocktail-party': GlassWater,
	'corporate-party': Users,
	'banquet-halls': Building2,
	restaurants: UtensilsCrossed,
	'farm-houses': Trees,
	'kitty-party': PartyPopper,
};

type CategoryStripProps = {
	activeTag: string;
	onChange: (tag: string) => void;
};

export function CategoryStrip({ activeTag, onChange }: CategoryStripProps) {
	return (
		<nav aria-label="Venue categories" className="home-categories">
			<ul className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{HOME_BROWSE_CATEGORIES.map((category) => {
					const Icon = CATEGORY_ICONS[category.id] ?? Home;
					const active = activeTag === category.tag;

					return (
						<li key={category.id} className="shrink-0">
							<button
								type="button"
								onClick={() => onChange(category.tag)}
								className={cn(
									'flex min-w-[5.5rem] flex-col items-center gap-2 px-3 py-2 text-xs transition-colors',
									active
										? 'border-b-2 border-foreground font-semibold text-foreground'
										: 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
								)}
							>
								<Icon className="size-5" aria-hidden />
								<span>{category.label}</span>
							</button>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
