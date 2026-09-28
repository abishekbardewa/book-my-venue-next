export const PLATFORM_FEE_PERCENT = 10;

export function splitPaymentAmount(amountInMajor: number) {
	const totalPaise = Math.round(amountInMajor * 100);
	const ownerSharePaise = Math.round((totalPaise * (100 - PLATFORM_FEE_PERCENT)) / 100);
	const platformFeePaise = totalPaise - ownerSharePaise;
	return {
		totalPaise,
		ownerSharePaise,
		platformFeePaise,
		ownerShare: (ownerSharePaise / 100).toFixed(2),
		platformFee: (platformFeePaise / 100).toFixed(2),
	};
}
