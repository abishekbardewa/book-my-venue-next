import { OnboardingGuard } from '@/components/auth/OnboardingGuard';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<SiteHeader />
			<main className="page-rise flex-1">
				<OnboardingGuard>{children}</OnboardingGuard>
			</main>
			<SiteFooter />
		</>
	);
}
