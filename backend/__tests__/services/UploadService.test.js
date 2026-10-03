const uploadService = require('../../src/services/UploadService');

describe('UploadService', () => {
  describe('isValidImageBuffer', () => {
    it('should identify valid JPEG buffer', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01]);
      expect(uploadService.isValidImageBuffer(jpegBuffer)).toBe(true);
    });

    it('should identify valid PNG buffer', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
      expect(uploadService.isValidImageBuffer(pngBuffer)).toBe(true);
    });

    it('should identify valid WebP buffer', () => {
      const webpBuffer = Buffer.concat([
        Buffer.from([0x52, 0x49, 0x46, 0x46]), // 'RIFF'
        Buffer.from([0x24, 0x00, 0x00, 0x00]), // size
        Buffer.from('WEBP', 'ascii')           // 'WEBP'
      ]);
      expect(uploadService.isValidImageBuffer(webpBuffer)).toBe(true);
    });

    it('should reject buffers smaller than 12 bytes', () => {
      const shortBuffer = Buffer.from([0xff, 0xd8, 0xff]);
      expect(uploadService.isValidImageBuffer(shortBuffer)).toBe(false);
    });

    it('should reject non-image file buffers (e.g. text/exe)', () => {
      const textBuffer = Buffer.from('This is a plain text file that is not an image');
      expect(uploadService.isValidImageBuffer(textBuffer)).toBe(false);
    });
  });

  describe('uploadAvatar', () => {
    it('should throw a 400 error for invalid image buffer', async () => {
      const fakeBuffer = Buffer.from('not an image buffer');
      await expect(uploadService.uploadAvatar(fakeBuffer)).rejects.toThrow('Invalid image format');
    });

    it('should fallback to data URI when Cloudinary is not configured', async () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01]);
      const result = await uploadService.uploadAvatar(jpegBuffer, 'image/jpeg');

      expect(result).toHaveProperty('url');
      expect(result.url).toMatch(/^data:image\/jpeg;base64,/);
      expect(result).toHaveProperty('publicId');
      expect(result.publicId).toMatch(/^dev_/);
    });
  });

  describe('deleteImage', () => {
    it('should silently skip deletion for dev placeholders', async () => {
      await expect(uploadService.deleteImage('dev_123456789')).resolves.toBeUndefined();
    });

    it('should silently handle null or empty publicId', async () => {
      await expect(uploadService.deleteImage(null)).resolves.toBeUndefined();
      await expect(uploadService.deleteImage('')).resolves.toBeUndefined();
    });
  });
});
