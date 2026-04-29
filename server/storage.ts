import { put } from "@vercel/blob";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
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
  const blob = await put(key, buffer, {
    access: "private",
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
