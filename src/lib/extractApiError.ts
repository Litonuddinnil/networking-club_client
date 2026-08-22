/**
 * Pulls a human-readable message from an axios / fetch error.
 *
 * Axios puts the server JSON body on `error.response.data`. We try the common
 * shapes ({ error }, { message }, { error: { message } }, plain string) so the
 * admin can see exactly what went wrong instead of "Failed to save.".
 */
export function extractApiError(err: any, fallback = "Something went wrong."): string {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  // Axios-specific: response body
  const data = err?.response?.data;
  if (data) {
    if (typeof data === "string") return data;
    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;
    if (data.error?.message) return data.error.message;
  }

  // Network / generic Error
  if (err?.message && typeof err.message === "string") {
    return err.message;
  }

  return fallback;
}
