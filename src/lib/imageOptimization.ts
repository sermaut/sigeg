export type ImageSize = 'thumb' | 'medium' | 'full';

export const IMAGE_SIZES = {
  thumb: 64,
  medium: 256,
  full: 512,
} as const;

export const compressImage = async (
  file: File,
  maxWidth: number = IMAGE_SIZES.full,
  quality: number = 0.7
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.\w+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const generateMultipleSizes = async (
  file: File
): Promise<{ thumb: File; medium: File; full: File }> => {
  const [thumb, medium, full] = await Promise.all([
    compressImage(file, IMAGE_SIZES.thumb, 0.7),
    compressImage(file, IMAGE_SIZES.medium, 0.7),
    compressImage(file, IMAGE_SIZES.full, 0.7),
  ]);

  return { thumb, medium, full };
};

export const getImageUrl = (baseUrl: string, size?: ImageSize): string => {
  if (!baseUrl || !size) return baseUrl;
  
  const ext = baseUrl.split('.').pop();
  const basePath = baseUrl.replace(`.${ext}`, '');
  
  return `${basePath}_${size}.webp`;
};
