// Storage helpers - stores files as base64 data URLs (no external service needed)
// Files are stored directly in the database as data URLs

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

// In-memory store for uploaded files (keyed by fileKey)
// This persists within a single serverless function invocation
// For production, files are stored as data URLs in the database
const fileStore = new Map<string, { data: string; contentType: string }>();

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  // Convert data to base64
  let base64: string;
  if (typeof data === "string") {
    // Assume already base64 or text
    base64 = Buffer.from(data).toString("base64");
  } else {
    base64 = Buffer.from(data).toString("base64");
  }

  // Create a data URL
  const dataUrl = `data:${contentType};base64,${base64}`;

  // Store in memory map (will be used if storageGet is called in same invocation)
  fileStore.set(key, { data: base64, contentType });

  // Return the data URL as the "url" - this gets stored in the database
  return { key, url: dataUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  const stored = fileStore.get(key);
  if (stored) {
    return {
      key,
      url: `data:${stored.contentType};base64,${stored.data}`,
    };
  }

  // If not in memory, the URL was stored in the database - return a placeholder
  return { key, url: "" };
}
