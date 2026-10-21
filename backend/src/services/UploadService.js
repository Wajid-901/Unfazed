const cloudinary = require('cloudinary').v2;

class UploadService {
  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    this.apiKey = process.env.CLOUDINARY_API_KEY;
    this.apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (this.isConfigured()) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        secure: true
      });
    }
  }

  isConfigured() {
    return Boolean(
      this.cloudName &&
      this.apiKey &&
      this.apiSecret &&
      !this.cloudName.includes('placeholder')
    );
  }

  // Magic bytes inspection to prevent MIME spoofing
  isValidImageBuffer(buffer) {
    if (!buffer || buffer.length < 12) return false;

    // JPEG: FF D8 FF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    // PNG: 89 50 4E 47
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    // WebP: RIFF .... WEBP
    const isWebP =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer.toString('ascii', 8, 12) === 'WEBP';

    return isJpeg || isPng || isWebP;
  }

  // Upload an avatar buffer to Cloudinary
  async uploadAvatar(buffer, mimeType = 'image/jpeg') {
    if (!this.isValidImageBuffer(buffer)) {
      const err = new Error('Invalid image format. Allowed formats: JPEG, PNG, WebP.');
      err.statusCode = 400;
      throw err;
    }

    if (!this.isConfigured()) {
      console.log('[UploadService Dev Fallback] Cloudinary not configured; using data URI.');
      const base64 = buffer.toString('base64');
      return {
        url: `data:${mimeType};base64,${base64}`,
        publicId: `dev_${Date.now()}`
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'unfazed/avatars',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' }
          ],
          format: 'webp'
        },
        (error, result) => {
          if (error) {
            console.error('[UploadService] Cloudinary error:', error);
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  // Delete prior image from Cloudinary
  async deleteImage(publicId) {
    if (!publicId || !this.isConfigured() || publicId.startsWith('dev_')) return;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn('[UploadService] Failed to delete old image from Cloudinary:', err.message);
    }
  }
}

module.exports = new UploadService();
