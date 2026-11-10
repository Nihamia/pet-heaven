export const maxOriginalPhotoBytes = 8 * 1024 * 1024;
export const maxProcessedPhotoLength = 150_000;
export const petPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];

async function decodePhoto(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Some browsers decode formats through an image element that their bitmap API rejects.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function processPetImage(file) {
  if (!petPhotoTypes.includes(file?.type)) {
    throw new Error('Choose a JPEG, PNG or WebP photo. For HEIC, export it as JPEG first.');
  }
  if (file.size > maxOriginalPhotoBytes) throw new Error('Choose a photo that is 8 MB or smaller.');

  let image;
  try {
    image = await decodePhoto(file);
  } catch {
    throw new Error('This photo could not be opened. Choose a different image.');
  }

  try {
    const width = image.naturalWidth ?? image.width;
    const height = image.naturalHeight ?? image.height;
    if (!width || !height) throw new Error('This photo has no usable image area.');
    const cropWidth = Math.min(width, height * 4 / 3);
    const cropHeight = cropWidth * 3 / 4;
    const units = Math.max(1, Math.min(250, Math.floor(cropWidth / 4)));
    const canvas = document.createElement('canvas');
    canvas.width = units * 4;
    canvas.height = units * 3;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is unavailable in this browser.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, (width - cropWidth) / 2, (height - cropHeight) / 2, cropWidth, cropHeight,
      0, 0, canvas.width, canvas.height);

    let mime = 'image/webp';
    for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]) {
      let src = canvas.toDataURL(mime, quality);
      if (mime === 'image/webp' && !src.startsWith('data:image/webp;base64,')) {
        mime = 'image/jpeg';
        src = canvas.toDataURL(mime, quality);
      }
      if (src.startsWith('data:' + mime + ';base64,') && src.length <= maxProcessedPhotoLength) return src;
    }
    throw new Error('This photo is still too large after compression. Choose a smaller photo.');
  } finally {
    image.close?.();
  }
}
