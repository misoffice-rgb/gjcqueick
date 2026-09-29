/**
 * Shared error handling utilities for extracting and displaying
 * backend errors from Axios responses.
 */

/**
 * Extract the best human-readable error message from an Axios error.
 * Checks `message`, `detail`, and the first validation error in `errors`.
 */
export function getErrorMessage(error: any, fallback: string): string {
  const data = error.response?.data;
  if (!data) return fallback;

  if (data.message) return data.message;
  if (data.detail) return data.detail;

  // Flatten the first validation error from the errors object
  if (data.errors) {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey) {
      const val = data.errors[firstKey];
      return Array.isArray(val) ? val[0] : val;
    }
  }

  return fallback;
}

/**
 * Push backend validation errors into react-hook-form field errors.
 * Expects the `errors` object from `error.response.data.errors`
 * where each key is a field name and values are string or string[].
 */
export function setFieldErrors(
  setError: (name: any, error: { type: string; message: string }) => void,
  errors: Record<string, string | string[]>,
) {
  Object.keys(errors).forEach((key) => {
    setError(key, {
      type: "manual",
      message: Array.isArray(errors[key])
        ? errors[key][0]
        : (errors[key] as string),
    });
  });
}
