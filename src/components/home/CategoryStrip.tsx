'use client';

import {
	Building2,
	Cake,
	GlassWater,
	Heart,
	Home,
	Gem,
	PartyPopper,
	Trees,
	Users,
	UtensilsCrossed,
	Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PROPERTY_CATEGORIES } from '@/features/properties/constants';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
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
		<nav aria-label="Listing categories" className="home-categories">
			<ul className="flex flex-wrap justify-center gap-2">
				{PROPERTY_CATEGORIES.map((category) => {
					const Icon = CATEGORY_ICONS[category.tagName] ?? Home;
					const active = activeTag === category.tagName;

					return (
						<li key={category.tagName}>
							<button
								type="button"
								onClick={() => onChange(active ? '' : category.tagName)}
								aria-pressed={active}
								className={cn(
									'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
									active
										? 'bg-primary text-primary-foreground'
										: 'bg-background text-muted-foreground hover:bg-background/80 hover:text-foreground'
								)}
							>
								<Icon className="size-3.5" aria-hidden />
								{category.label}
							</button>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
