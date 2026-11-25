export interface WatermarkOptions {
  agencyName?: string;
  brokerPhone?: string;
  watermarkType?: 'badge' | 'diagonal' | 'banner';
}

export const applyWatermarkToImage = (
  imageFile: File | Blob,
  options: WatermarkOptions = {}
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Keep original resolution up to 2400px
        const maxDim = 2400;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw original photo
        ctx.drawImage(img, 0, 0, width, height);

        const agency = options.agencyName || 'LeadNivash Verified';
        const phone = options.brokerPhone ? `📞 ${options.brokerPhone}` : '';

        if (options.watermarkType === 'diagonal') {
          // Subtle diagonal watermark across center
          ctx.save();
          ctx.translate(width / 2, height / 2);
          ctx.rotate(-Math.PI / 6);
          ctx.font = `bold ${Math.max(28, Math.round(width * 0.045))}px Inter, sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 8;
          ctx.fillText(agency.toUpperCase(), 0, 0);
          if (phone) {
            ctx.font = `${Math.max(18, Math.round(width * 0.025))}px Inter, sans-serif`;
            ctx.fillText(phone, 0, Math.round(width * 0.035));
          }
          ctx.restore();
        } else {
          // Modern bottom branded pill / banner
          const bannerHeight = Math.max(50, Math.round(height * 0.085));
          const y = height - bannerHeight;

          // Gradient backdrop
          const grad = ctx.createLinearGradient(0, y - 20, 0, height);
          grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
          grad.addColorStop(0.3, 'rgba(15, 23, 42, 0.85)');
          grad.addColorStop(1, 'rgba(11, 15, 23, 0.98)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, y - 20, width, bannerHeight + 20);

          // Top emerald accent line on banner
          ctx.fillStyle = '#00875A';
          ctx.fillRect(0, y - 2, width, 4);

          // Text metrics
          const titleSize = Math.max(16, Math.round(width * 0.024));
          const subSize = Math.max(12, Math.round(width * 0.016));

          // Agency / Broker Title
          ctx.font = `bold ${titleSize}px Inter, sans-serif`;
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'left';
          ctx.fillText(agency, 24, y + bannerHeight * 0.45);

          // Subtitle / Verified badge
          ctx.font = `500 ${subSize}px Inter, sans-serif`;
          ctx.fillStyle = '#94A3B8';
          ctx.fillText(
            phone ? `${phone} • Verified Listing` : 'Verified Real Estate Listing • LeadNivash',
            24,
            y + bannerHeight * 0.8
          );

          // LeadNivash brand pill on right side
          ctx.textAlign = 'right';
          ctx.font = `bold ${subSize}px Inter, sans-serif`;
          ctx.fillStyle = '#34D399';
          ctx.fillText('LeadNivash', width - 24, y + bannerHeight * 0.6);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas blob generation failed'));
            }
          },
          'image/jpeg',
          0.92
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for watermarking'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
};
