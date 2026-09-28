export const IMAGEKIT_FOLDERS = {
	properties: '/bmv-properties',
	avatars: '/bmv-user-avatars',
} as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_PROPERTY_IMAGES = 5;
export const PROPERTY_IMAGE_MAX_PX = 800;
export const AVATAR_IMAGE_MAX_PX = 300;
export const UPLOAD_QUALITY = 0.8;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;

export type ImageKitFolder = (typeof IMAGEKIT_FOLDERS)[keyof typeof IMAGEKIT_FOLDERS];

export type SavedPropertyImage = {
	imgUrl: string;
	imagekitFileId: string;
	caption?: string;
};
