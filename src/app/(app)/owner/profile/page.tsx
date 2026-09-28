import { redirect } from 'next/navigation';

export default function OwnerProfileRedirectPage() {
	redirect('/settings');
}
