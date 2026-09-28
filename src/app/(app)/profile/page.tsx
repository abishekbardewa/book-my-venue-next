import { redirect } from 'next/navigation';

type ProfileRedirectPageProps = {
	searchParams: Promise<{ tab?: string }>;
};

export default async function ProfileRedirectPage({ searchParams }: ProfileRedirectPageProps) {
	const params = await searchParams;
	const tab = params.tab ? `?tab=${encodeURIComponent(params.tab)}` : '';
	redirect(`/settings${tab}`);
}
