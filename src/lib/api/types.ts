export type ApiSuccessResponse<T> = {
	success: true;
	statusCode: number;
	message: string;
	data: T;
};

export type ApiErrorDetail = {
	field: string;
	message: string;
};

export type ApiErrorResponse = {
	success: false;
	statusCode: number;
	message: string;
	details?: ApiErrorDetail[];
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
