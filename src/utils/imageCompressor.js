function compressWithCanvas(img, originalFile, { maxWidth, maxSizeMB }) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let { width, height } = img;
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    function attemptCompression(quality) {
      canvas.toBlob((blob) => {
        if (blob.size > maxSizeBytes && quality > 0.3) {
          attemptCompression(Math.round((quality - 0.1) * 10) / 10);
          return;
        }
        const compressedFile = new File(
          [blob],
          originalFile.name.replace(/\.[^.]+$/, '.jpg'),
          { type: 'image/jpeg', lastModified: Date.now() },
        );
        const reduction = ((originalFile.size - blob.size) / originalFile.size) * 100;
        resolve({
          file: compressedFile,
          originalSize: originalFile.size,
          compressedSize: blob.size,
          reduction: Math.round(reduction * 10) / 10,
          skipped: false,
        });
      }, 'image/jpeg', quality);
    }

    attemptCompression(0.7);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to decode image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

export async function compressImageRecursive(file, options) {
  const img = await loadImage(file);
  return compressWithCanvas(img, file, options);
}

export function compressImage(file, { maxWidth = 1200, quality = 0.7, maxSizeMB = 2 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      resolve({
        file, skipped: true, originalSize: file.size, compressedSize: file.size, reduction: 0,
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        compressWithCanvas(img, file, { maxWidth, quality, maxSizeMB })
          .then(resolve)
          .catch(reject);
      };
      img.onerror = () => reject(new Error('Failed to decode image — file may be corrupted'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
