import { OnboardingGuard } from '@/components/auth/OnboardingGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return <OnboardingGuard>{children}</OnboardingGuard>;
}
