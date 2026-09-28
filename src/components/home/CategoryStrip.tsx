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
	variant?: 'default' | 'hero';
};

export function CategoryStrip({
	activeTag,
	onChange,
	variant = 'default',
}: CategoryStripProps) {
	return (
		<nav
			aria-label="Listing categories"
			className={cn('home-categories w-full', variant === 'hero' && 'max-w-4xl')}
		>
			<ul className="-mx-1 flex flex-nowrap justify-start gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0">
				{PROPERTY_CATEGORIES.map((category) => {
					const Icon = CATEGORY_ICONS[category.tagName] ?? Home;
					const active = activeTag === category.tagName;

					return (
						<li key={category.tagName} className="shrink-0">
							<button
								type="button"
								onClick={() => onChange(active ? '' : category.tagName)}
								aria-pressed={active}
								className={cn(
									'inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs font-semibold tracking-[0.08em] uppercase transition-[color,background-color,border-color] duration-200',
									active
										? 'border-primary bg-primary text-primary-foreground'
										: variant === 'hero'
											? 'border-white/50 bg-card/60 text-foreground backdrop-blur-sm hover:border-primary hover:text-foreground'
											: 'border-structural-border bg-background text-muted-foreground hover:border-primary hover:text-foreground'
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
