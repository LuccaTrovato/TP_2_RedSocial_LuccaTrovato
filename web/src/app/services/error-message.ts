export function errorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'message' in error.error
  ) {
    const message = error.error.message;
    return Array.isArray(message) ? message.join(' ') : String(message);
  }
  return fallback;
}
