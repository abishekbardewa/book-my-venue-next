export class ApiError extends Error {
	statusCode: number;
	details?: Array<{ field: string; message: string }>;

	constructor(
		message: string,
		statusCode: number,
		details?: Array<{ field: string; message: string }>,
	) {
		super(message);
		this.name = 'ApiError';
		this.statusCode = statusCode;
		this.details = details;
	}
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		return error.message;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return 'Something went wrong';
}

export function getFieldErrors(
	error: unknown,
	allowedFields: readonly string[],
): Partial<Record<string, string>> {
	if (!(error instanceof ApiError) || !error.details?.length) {
		return {};
	}

	const allowed = new Set(allowedFields);
	const fieldErrors: Partial<Record<string, string>> = {};

	for (const detail of error.details) {
		if (!allowed.has(detail.field) || fieldErrors[detail.field]) {
			continue;
		}
		fieldErrors[detail.field] = detail.message;
	}

	return fieldErrors;
}
