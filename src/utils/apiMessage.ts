/**
 * Helpers for surfacing backend-provided messages in notifications.
 *
 * Policy (see product decision): always prefer the message the API returns.
 * Only fall back to a generic English message when the API error carries no
 * message of its own.
 */

interface ApiErrorShape {
    response?: {
        data?: {
            message?: unknown;
            error?: unknown;
        };
    };
    message?: unknown;
}

interface ApiDataShape {
    message?: unknown;
}

const asText = (value: unknown): string | undefined =>
    typeof value === "string" && value.trim() !== "" ? value : undefined;

/**
 * Pulls the human-readable message out of an Axios/fetch error, checking the
 * common backend shapes (`response.data.message`, then `response.data.error`).
 * Returns `fallback` (English) when nothing usable is present — never the raw
 * "Network Error" / axios internals.
 */
export const getApiErrorMessage = (err: unknown, fallback: string): string => {
    const e = err as ApiErrorShape;
    return asText(e?.response?.data?.message) ?? asText(e?.response?.data?.error) ?? fallback;
};

/**
 * Pulls a message from a successful response body when the API includes one,
 * otherwise returns the provided English default.
 */
export const getApiMessage = (data: unknown, fallback: string): string =>
    asText((data as ApiDataShape)?.message) ?? fallback;
