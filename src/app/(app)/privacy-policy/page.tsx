import type { Metadata } from 'next';
import { PolicyPageShell } from '@/components/legal/PolicyPageShell';

export const metadata: Metadata = {
	title: 'Privacy Policy',
};

export default function PrivacyPolicyPage() {
	return (
		<PolicyPageShell
			title="Privacy Policy"
			description="How Book My Venue collects, uses, and protects your information."
			activeHref="/privacy-policy"
			sections={[
				{
					id: 'information-collection',
					title: 'Information Collection',
					content: (
						<>
							<p>
								We collect information to provide better services to all our users. The types
								of personal information we collect include:
							</p>
							<ul>
								<li>
									<strong>Account Information:</strong> Name, email address, phone number, and
									password when you register.
								</li>
								<li>
									<strong>Booking Data:</strong> Venue preferences, reservation dates, and
									event requirements.
								</li>
								<li>
									<strong>Payment Information:</strong> Billing details processed securely by
									our payment partners.
								</li>
								<li>
									<strong>Usage Data:</strong> How you interact with the platform, including
									device and access information.
								</li>
							</ul>
						</>
					),
				},
				{
					id: 'information-usage',
					title: 'Information Usage',
					content: (
						<>
							<p>We use collected information to:</p>
							<ul>
								<li>Process and manage venue bookings.</li>
								<li>Communicate about reservations, updates, and important account notices.</li>
								<li>Improve our platform through analytics and feedback.</li>
								<li>Comply with legal obligations and resolve disputes.</li>
							</ul>
						</>
					),
				},
				{
					id: 'data-security',
					title: 'Data Security',
					content: (
						<>
							<p>
								We implement security measures to protect your personal information. Payment
								processing is handled by trusted providers. No method of transmission over the
								internet is 100% secure, and we continuously improve our safeguards.
							</p>
						</>
					),
				},
				{
					id: 'your-rights',
					title: 'Your Rights',
					content: (
						<p>
							You may access, correct, or request deletion of your personal data through your
							account settings or by contacting support. You may also object to or restrict
							certain processing where applicable.
						</p>
					),
				},
				{
					id: 'contact-us',
					title: 'Contact Us',
					content: (
						<>
							<p>Questions about this Privacy Policy can be sent to:</p>
							<p>
								<strong>privacy@bookmyvenue.com</strong>
							</p>
						</>
					),
				},
			]}
		/>
	);
}
