import type { ZodTypeAny } from 'zod';

export function formDataToObject(formData: FormData): Record<string, string> {
	const values: Record<string, string> = {};
	for (const [key, value] of formData.entries()) {
		if (typeof value === 'string') {
			values[key] = value;
		}
	}
	return values;
}

export function zodFieldErrors(
	schema: ZodTypeAny,
	values: unknown,
): Partial<Record<string, string>> {
	const result = schema.safeParse(values);
	if (result.success) {
		return {};
	}

	const fieldErrors: Partial<Record<string, string>> = {};
	for (const issue of result.error.issues) {
		const field = issue.path[0];
		if (typeof field !== 'string' || fieldErrors[field]) {
			continue;
		}
		fieldErrors[field] = issue.message;
	}
	return fieldErrors;
}
