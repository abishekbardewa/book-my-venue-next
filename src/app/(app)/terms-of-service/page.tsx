import type { Metadata } from 'next';
import { PolicyPageShell } from '@/components/legal/PolicyPageShell';

export const metadata: Metadata = {
	title: 'Terms of Service',
};

export default function TermsOfServicePage() {
	return (
		<PolicyPageShell
			title="Terms of Service"
			description="The rules and expectations for using Book My Venue as a customer or venue owner."
			activeHref="/terms-of-service"
			sections={[
				{
					id: 'acceptance',
					title: 'Acceptance of Terms',
					content: (
						<p>
							By accessing or using Book My Venue, you agree to these Terms of Service. If you
							do not agree, do not use the platform.
						</p>
					),
				},
				{
					id: 'accounts',
					title: 'Accounts & Eligibility',
					content: (
						<ul>
							<li>You must provide accurate account information and keep it up to date.</li>
							<li>You are responsible for activity under your account.</li>
							<li>Owners must ensure listing details are truthful and lawful.</li>
						</ul>
					),
				},
				{
					id: 'bookings',
					title: 'Bookings & Payments',
					content: (
						<ul>
							<li>Bookings are subject to venue availability and owner approval where required.</li>
							<li>Payments are processed through our payment partner in test or live mode as configured.</li>
							<li>Platform fees, if any, are disclosed during checkout or in owner payout settings.</li>
						</ul>
					),
				},
				{
					id: 'listings',
					title: 'Listings & Moderation',
					content: (
						<p>
							Submitted listings may be reviewed before appearing publicly. We may approve,
							reject, or request changes to listings that violate these terms or local law.
						</p>
					),
				},
				{
					id: 'liability',
					title: 'Limitation of Liability',
					content: (
						<p>
							Book My Venue connects customers and venue owners. We are not a party to the
							underlying event contract except as required for payment processing. Use of venues
							and compliance with local regulations remain the responsibility of the parties
							involved.
						</p>
					),
				},
				{
					id: 'contact',
					title: 'Contact',
					content: (
						<p>
							For questions about these terms, contact{' '}
							<strong>support@bookmyvenue.com</strong>.
						</p>
					),
				},
			]}
		/>
	);
}
