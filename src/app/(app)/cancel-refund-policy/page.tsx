import type { Metadata } from 'next';
import { PolicyPageShell } from '@/components/legal/PolicyPageShell';

export const metadata: Metadata = {
	title: 'Cancellation & Refund Policy',
};

export default function CancelRefundPolicyPage() {
	return (
		<PolicyPageShell
			title="Cancellation & Refund Policy"
			description="How cancellations and refunds work for customers and venue owners on Book My Venue."
			activeHref="/cancel-refund-policy"
			sections={[
				{
					id: 'guest-cancellation',
					title: 'Customer cancellation',
					content: (
						<>
							<p>
								Customers may request cancellation from their bookings dashboard while a booking is
								awaiting owner approval or confirmed, subject to platform rules and timing.
							</p>
							<ul>
								<li>
									Cancellations before owner confirmation are typically refunded in full to the
									original payment method.
								</li>
								<li>
									After confirmation, refund eligibility depends on timing relative to the event
									dates and any applicable platform rules.
								</li>
							</ul>
						</>
					),
				},
				{
					id: 'owner-rejection',
					title: 'Owner Rejection',
					content: (
						<p>
							If an owner rejects a booking while it is awaiting approval, the successful payment
							is refunded and the booking is cancelled. No venue transfer is completed for
							rejected bookings.
						</p>
					),
				},
				{
					id: 'refund-timing',
					title: 'Refund Timing',
					content: (
						<p>
							Refunds are initiated to the original payment method after cancellation is
							confirmed. Bank or card issuer timelines may take several business days to reflect
							the credit.
						</p>
					),
				},
				{
					id: 'exceptions',
					title: 'Exceptions',
					content: (
						<p>
							Force majeure, unsafe venue conditions, or platform errors may be reviewed case by
							case by support. Contact us promptly with booking reference details.
						</p>
					),
				},
				{
					id: 'contact',
					title: 'Contact Support',
					content: (
						<p>
							For refund questions, email <strong>support@bookmyvenue.com</strong> with your
							booking reference ID.
						</p>
					),
				},
			]}
		/>
	);
}
