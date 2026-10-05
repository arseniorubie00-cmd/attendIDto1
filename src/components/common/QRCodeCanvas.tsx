import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({
  value,
  size = 200,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    }).catch(err => {
      console.error('Error generating QR code', err);
    });
  }, [value, size]);

  return (
    <div className={`flex items-center justify-center p-2 bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};
