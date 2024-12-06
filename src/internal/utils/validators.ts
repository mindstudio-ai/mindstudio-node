export function validateApiKey(key?: string): string {
  if (!key) {
    throw new Error("API key is required");
  }
  if (typeof key !== "string") {
    throw new Error("API key must be a string");
  }
  if (key.trim().length === 0) {
    throw new Error("API key cannot be empty");
  }
  return key.trim();
}
