import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface ClientQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const ClientQRCode: React.FC<ClientQRCodeProps> = ({
  value,
  size = 240,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      // Clear canvas before drawing
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
      }

      QRCode.toCanvas(
        canvas,
        value,
        {
          width: size,
          margin: 3, // Full quiet zone to prevent camera scan failures
          color: {
            dark: '#000000', // Pure black for 100% optical camera readability
            light: '#ffffff'  // Pure white
          },
          errorCorrectionLevel: 'M'
        },
        (error) => {
          if (error) console.error('Client QR Code generation error:', error);
        }
      );
    }
  }, [value, size]);

  return (
    <div className="bg-white p-2 rounded-2xl flex items-center justify-center shadow-inner">
      <canvas
        ref={canvasRef}
        className={`mx-auto block ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

