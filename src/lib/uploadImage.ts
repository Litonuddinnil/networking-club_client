/**
 * uploadImage.ts
 * --------------
 * Thin client-side wrapper around the imgbb free image hosting API.
 *
 * Required env var (already in your .env.local):
 *   VITE_IMGBB_API_KEY=f7e8f7172aaf2bc591027741572146cc
 *
 * imgbb accepts multipart/form-data with the file under the `image` field,
 * along with a `key` query param. The API returns the hosted URL under
 * `data.display_url` (or `data.url`). We expose a typed helper that:
 *   1. Validates the file (type + ~5MB cap)
 *   2. Posts to https://api.imgbb.com/1/upload
 *   3. Returns the public URL on success or throws with a useful message
 */

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export interface UploadResult {
  url: string;
  displayUrl: string;
  deleteUrl?: string;
  width?: number;
  height?: number;
}

export class ImageUploadError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ImageUploadError";
    this.status = status;
  }
}

/**
 * Uploads a File / Blob to imgbb and returns the hosted URL.
 *
 * @param file - The image File selected via <input type="file" /> or drag-drop.
 * @returns Resolves with the public image URL.
 */
export async function uploadImageToImgbb(file: File): Promise<string> {
  const apiKey =
    (import.meta.env.VITE_IMGBB_API_KEY as string | undefined) ||
    (import.meta.env.IMAGE_BB_API_KEY as string | undefined);

  if (!apiKey) {
    throw new ImageUploadError(
      "Missing imgbb API key — set VITE_IMGBB_API_KEY in .env.local",
    );
  }

  if (!file) {
    throw new ImageUploadError("No file provided");
  }

  if (!file.type || !file.type.startsWith("image/")) {
    throw new ImageUploadError(
      `Unsupported file type: ${file.type || "unknown"}. Please pick an image.`,
    );
  }

  if (file.size > MAX_BYTES) {
    throw new ImageUploadError(
      `Image is ${(file.size / 1024 / 1024).toFixed(1)} MB — imgbb free tier caps at 5 MB.`,
    );
  }

  // imgbb accepts either a base64 string or a file. We use a base64 data URL
  // so we can send it via fetch + FormData without juggling multipart parts.
  // imgbb's free tier requires the RAW base64 payload — strip the
  // "data:image/...;base64," prefix or it rejects with "Invalid base64 string".
  const dataUrl = await fileToBase64(file);
  const base64 = stripDataUrlPrefix(dataUrl);

  const form = new FormData();
  form.append("image", base64);

  let res: Response;
  try {
    res = await fetch(`${IMGBB_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body: form,
    });
  } catch (err: any) {
    throw new ImageUploadError(
      `Network error while uploading to imgbb: ${err?.message || "unknown"}`,
    );
  }

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    /* non-JSON body */
  }

  if (!res.ok || !payload?.success) {
    const apiMessage =
      payload?.error?.message ||
      payload?.status_txt ||
      `imgbb returned HTTP ${res.status}`;
    throw new ImageUploadError(apiMessage, res.status);
  }

  const data = payload.data || {};
  const url: string | undefined = data.display_url || data.url;
  if (!url) {
    throw new ImageUploadError("imgbb response missing image URL");
  }

  return url;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(reader.error || new Error("FileReader failed"));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("Unexpected FileReader result type"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Strips the "data:<mime>;base64," prefix from a data URL so the payload is a
 * raw base64 string — which is what imgbb's free tier actually accepts. Sending
 * the prefixed form causes imgbb to reject with "Invalid base64 string".
 */
function stripDataUrlPrefix(dataUrl: string): string {
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx === -1) return dataUrl;
  return dataUrl.slice(commaIdx + 1);
}