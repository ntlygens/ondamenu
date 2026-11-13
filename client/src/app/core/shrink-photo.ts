/**
 * Shrinks a photo in the browser before it is uploaded, so storage stays small (and free).
 * The picture is scaled to fit `maxSide` pixels and saved as WebP (JPEG where the browser cannot write WebP),
 * then squeezed further until it is no bigger than `targetBytes`.
 * Throws an Error with a message to show when the file is not a picture the browser can read.
 */
export async function shrinkPhoto(file: File, maxSide: number, targetBytes: number): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose a photo.');
  const source = await load(file);
  try {
    let scale = Math.min(1, maxSide / Math.max(source.width, source.height));
    let quality = 0.82;
    for (let attempt = 0; attempt < 12; attempt++) {
      const blob = await draw(source, scale, quality);
      if (blob.size <= targetBytes) return blob;
      // First lower the quality, then make the picture smaller.
      if (quality > 0.55) quality -= 0.09; else scale *= 0.85;
    }
    throw new Error('We could not make that photo small enough. Please try another one.');
  } finally {
    source.close();
  }
}

interface Source { width: number; height: number; image: CanvasImageSource; close(): void; }

async function load(file: File): Promise<Source> {
  try {
    // Respects the way the phone was held when the photo was taken.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    return { width: bitmap.width, height: bitmap.height, image: bitmap, close: () => bitmap.close() };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { width: img.naturalWidth, height: img.naturalHeight, image: img, close: () => undefined };
    } catch {
      throw new Error('We could not read that photo. Please try a JPEG or PNG.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

async function draw(source: Source, scale: number, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot prepare photos.');
  // White behind see-through pictures, since JPEG has no transparency.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source.image, 0, 0, canvas.width, canvas.height);
  const webp = await toBlob(canvas, 'image/webp', quality);
  // Browsers that cannot write WebP hand back a PNG instead: use JPEG there.
  if (webp && webp.type === 'image/webp') return webp;
  const jpeg = await toBlob(canvas, 'image/jpeg', quality);
  if (!jpeg) throw new Error('This browser cannot prepare photos.');
  return jpeg;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
