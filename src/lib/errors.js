/**
 * Extracts a human-readable message from an RTK Query / fetch error.
 *
 * Handles the API's response shapes:
 *  - { error: "..." }                                  → Result failures
 *  - { errors: [{ field, message }, ...] }             → FluentValidation failures
 *  - { title, errors: { Field: ["...", ...] } }        → ASP.NET ProblemDetails (model binding)
 *  - { message: "..." }
 * plus network failures (status "FETCH_ERROR") and plain strings.
 */
export function getErrorMessage(err, fallback = "An error occurred.") {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  if (err.status === "FETCH_ERROR") return "Could not reach the server. Check your connection and try again.";
  if (err.status === "TIMEOUT_ERROR") return "The request timed out. Please try again.";

  const data = err.data ?? err;
  if (typeof data === "string" && data.trim()) return data;
  if (!data || typeof data !== "object") return fallback;

  if (typeof data.error === "string" && data.error) return data.error;

  if (Array.isArray(data.errors) && data.errors.length) {
    const msgs = data.errors
      .map((e) => (typeof e === "string" ? e : e?.message))
      .filter(Boolean);
    if (msgs.length) return msgs.join(" ");
  }

  if (data.errors && typeof data.errors === "object") {
    const msgs = Object.values(data.errors).flat().filter((m) => typeof m === "string");
    if (msgs.length) return msgs.join(" ");
  }

  if (typeof data.message === "string" && data.message) return data.message;
  if (typeof data.title === "string" && data.title) return data.title;

  return fallback;
}
