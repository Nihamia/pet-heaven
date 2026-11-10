import { afterEach, describe, expect, it, vi } from 'vitest';
import { maxOriginalPhotoBytes, processPetImage } from '../utils/imageProcessing.js';

const webp = 'data:image/webp;base64,AAAA';
const jpeg = 'data:image/jpeg;base64,BBBB';
const oversizedWebp = webp + 'A'.repeat(150_000);
const png = new File(['original'], 'pet.png', { type: 'image/png' });

function imageMocks() {
  const bitmap = { width: 2000, height: 1000, close: vi.fn() };
  const decode = vi.fn(async () => bitmap);
  vi.stubGlobal('createImageBitmap', decode);
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect: vi.fn(), drawImage });
  const encode = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL');
  return { decode, drawImage, encode, bitmap };
}

describe('Staff pet photo processing', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('rejects unsupported types and originals over eight megabytes before decoding', async () => {
    const decode = vi.fn();
    vi.stubGlobal('createImageBitmap', decode);
    await expect(processPetImage({ type: 'image/heic', size: 250 })).rejects.toThrow('For HEIC, export it as JPEG');
    await expect(processPetImage({ type: 'image/jpeg', size: maxOriginalPhotoBytes + 1 })).rejects.toThrow('8 MB');
    expect(decode).not.toHaveBeenCalled();
  });

  it('uses EXIF orientation, crops to 4:3 and lowers quality to fit', async () => {
    const { decode, drawImage, encode, bitmap } = imageMocks();
    encode.mockReturnValueOnce(oversizedWebp).mockReturnValueOnce(webp);
    await expect(processPetImage(png)).resolves.toBe(webp);
    expect(decode).toHaveBeenCalledWith(png, { imageOrientation: 'from-image' });
    expect(drawImage).toHaveBeenCalledWith(bitmap, expect.closeTo(333.33, 1), 0, expect.closeTo(1333.33, 1), 1000, 0, 0, 1000, 750);
    expect(encode.mock.calls).toEqual([['image/webp', 0.9], ['image/webp', 0.8]]);
    expect(bitmap.close).toHaveBeenCalledOnce();
  });

  it('falls back to JPEG when the browser cannot encode WebP', async () => {
    const { encode } = imageMocks();
    encode.mockReturnValueOnce('data:image/png;base64,AAAA').mockReturnValueOnce(jpeg);
    await expect(processPetImage(png)).resolves.toBe(jpeg);
    expect(encode.mock.calls).toEqual([['image/webp', 0.9], ['image/jpeg', 0.9]]);
  });

  it('rejects a photo that stays oversized at every quality', async () => {
    const { encode, bitmap } = imageMocks();
    encode.mockReturnValue(oversizedWebp);
    await expect(processPetImage(png)).rejects.toThrow('still too large');
    expect(encode).toHaveBeenCalledTimes(7);
    expect(bitmap.close).toHaveBeenCalledOnce();
  });
});
