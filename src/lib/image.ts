/**
 * Utility for client-side image compression and WebP conversion.
 * Leverages native HTML5 Canvas API for high performance and zero dependency overhead.
 */

/**
 * Compresses an image file and converts it to WebP format on the client side.
 * @param file The original image file
 * @param quality Compression quality (0.0 to 1.0). Default is 0.82 (optimal balance of size vs high quality).
 * @returns A promise resolving to the compressed WebP File
 */
export async function compressToWebP(file: File, quality = 0.82): Promise<File> {
  // If the file is not an image, return it as-is (e.g. documents, PDFs, videos)
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Preserve animated GIFs as standard canvas compression would strip their frames
  if (file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Auto-scale extremely large camera images (UHD 2K Max boundary)
        const MAX_DIMENSION = 2048;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas 2D context'));
          return;
        }

        // Draw image with smooth canvas scaling
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas representation to highly optimized WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert canvas to WebP Blob'));
              return;
            }

            // Create new file name with .webp extension
            const originalName = file.name;
            const lastDotIndex = originalName.lastIndexOf('.');
            const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
            const webpFileName = `${baseName}.webp`;

            const webpFile = new File([blob], webpFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
