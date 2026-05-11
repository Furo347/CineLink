export type ApiError = {
    response?: {
        data?: {
            message?: string;
            errors?: Array<{
                msg?: string;
                message?: string;
            }>;
        };
    };
};

export function getApiErrorMessage(error: unknown, fallback: string) {
    const apiError = error as ApiError;

    return (
        apiError.response?.data?.message ||
        apiError.response?.data?.errors?.[0]?.msg ||
        apiError.response?.data?.errors?.[0]?.message ||
        fallback
    );
}
