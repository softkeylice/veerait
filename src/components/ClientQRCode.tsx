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
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
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
    <canvas
      ref={canvasRef}
      className={`mx-auto rounded-2xl shadow-sm ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
