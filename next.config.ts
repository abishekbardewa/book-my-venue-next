import type { NextConfig } from 'next';

function imageKitHostname() {
	const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
	if (!endpoint) {
		return 'ik.imagekit.io';
	}
	try {
		return new URL(endpoint).hostname;
	} catch {
		return 'ik.imagekit.io';
	}
}

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: imageKitHostname(),
			},
		],
	},
};

export default nextConfig;
