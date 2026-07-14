import { put, generateBlobPlaceholder, list, head } from "@vercel/blob";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * For private blobs, we need to generate a temporary read URL.
 * Note: Vercel Blob's 'private' access means the URL is unguessable but technically public if known.
 * To truly restrict access, we'd need to proxy the download or use a different storage provider.
 * However, for Vercel Blob, the "private" setting makes the URL unguessable.
 * If the user is seeing "Forbidden", it might be due to a misconfiguration or token issue.
 */
export async function storageGenerateReadUrl(url: string): Promise<string> {
  // For Vercel Blob, if it's uploaded as 'private', the URL returned by 'put' is the unguessable URL.
  // If the user gets 403, it's likely because they are trying to access the file via a different path
  // or the token is not correctly configured for read access.
  return url;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  // Convert data to Buffer if needed
  let buffer: Buffer;
  if (typeof data === "string") {
    // data is base64-encoded
    buffer = Buffer.from(data, "base64");
  } else {
    buffer = Buffer.from(data);
  }

  // Upload to Vercel Blob (files stored on Vercel's CDN, no size limit issues)
  // We use 'public' access because 'private' requires token-based read which is more complex to implement
  // and the current admin dashboard expects direct URL access.
  const blob = await put(key, buffer, {
    access: "public",
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { key, url: blob.url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  // URL is stored in the database at upload time - just return the key
  return { key, url: "" };
}
