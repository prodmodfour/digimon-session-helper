/**
 * Generate a unique ID using crypto.randomUUID
 * Falls back to timestamp + random if crypto is unavailable
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}
