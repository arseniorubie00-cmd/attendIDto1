import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, RefreshCw, Upload, AlertCircle, CheckCircle2, ScanLine, XCircle } from 'lucide-react';

interface QRScannerViewProps {
  active: boolean;
  onScan: (scannedText: string) => void;
  lastFeedback?: {
    status: 'success' | 'duplicate' | 'error' | null;
    message: string;
    studentName?: string;
    timeIn?: string;
  };
}

export const QRScannerView: React.FC<QRScannerViewProps> = ({
  active,
  onScan,
  lastFeedback
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedToken, setLastScannedToken] = useState<string>('');

  const animFrameId = useRef<number | null>(null);
  const lastScanTimestamp = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    setIsScanning(false);
  }, []);

  // Frame processing loop with jsQR
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });

      if (code && code.data && code.data.trim()) {
        const now = Date.now();
        const detectedText = code.data.trim();

        // 2-second cooldown for identical code to prevent spamming
        if (detectedText !== lastScannedToken || now - lastScanTimestamp.current > 2200) {
          lastScanTimestamp.current = now;
          setLastScannedToken(detectedText);
          onScan(detectedText);
        }
      }
    }

    animFrameId.current = requestAnimationFrame(scanFrame);
  }, [lastScannedToken, onScan]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Camera access is not supported on this browser or connection. Please use manual input or image upload.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // needed for iOS
        await videoRef.current.play();
        setHasCamera(true);
        setIsScanning(true);
        animFrameId.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.warn('Camera error', err);
      // Fallback try without facingMode constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setHasCamera(true);
          setIsScanning(true);
          animFrameId.current = requestAnimationFrame(scanFrame);
          return;
        }
      } catch (fallbackErr) {
        console.warn('Fallback camera failed', fallbackErr);
      }

      setHasCamera(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera permissions in your browser bar.'
          : 'Unable to start camera. You can also upload a photo/screenshot of the QR code below.'
      );
    }
  }, [facingMode, scanFrame, stopCamera]);

  useEffect(() => {
    if (active) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [active, startCamera, stopCamera]);

  // Switch between back/front cameras
  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Image Upload Scanner (Decode QR code directly from photo/screenshot)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          onScan(code.data.trim());
        } else {
          alert('No valid QR code was detected in this image. Please ensure the QR code is clear and well-lit.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Video Viewport */}
      <div className="relative aspect-4/3 sm:aspect-16/10 bg-black rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center">
        
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isScanning ? 'opacity-100' : 'opacity-20'
          }`}
        />

        {/* Live Targeting Reticle & Laser Sweep */}
        {/* Live Targeting Reticle & Laser Sweep */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-[#fbbf24]/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.18)] flex flex-col justify-between">
              
              {/* Corner brackets in USTP Gold */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#fbbf24] rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#fbbf24] rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#fbbf24] rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#fbbf24] rounded-br-xl" />

              {/* Animated Laser Scanning Line in USTP Gold */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent shadow-[0_0_12px_#fbbf24] animate-bounce" />

              <div className="mt-auto pb-2 text-center">
                <span className="text-[10px] font-mono font-extrabold tracking-widest text-blue-950 bg-[#fbbf24] px-2.5 py-0.5 rounded-full shadow-xs">
                  ALIGN USTP QR PASS HERE
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Camera Permission / Error Overlay */}
        {!isScanning && (
          <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-[#07162c]/95 space-y-3">
            <Camera className="w-12 h-12 text-blue-300 animate-pulse" />
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-white">USTP QR Camera Scanner Ready</h4>
              <p className="text-xs text-blue-200/80">
                {cameraError || 'Click below to turn on the live camera scanner.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={startCamera}
                className="py-2 px-4 text-xs font-extrabold text-blue-950 bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-blue-950" />
                <span>Turn On Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 text-xs font-semibold text-blue-200 hover:text-white bg-[#0b2545] hover:bg-[#0f2f58] border border-blue-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4 text-[#fbbf24]" />
                <span>Upload QR Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Scanner Floating Controls (When Scanning) */}
        {isScanning && (
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="p-2.5 bg-[#07162c]/90 hover:bg-[#0b2545] border border-blue-800 rounded-xl text-white cursor-pointer transition-all shadow-md"
              title="Switch Front/Back Camera"
            >
              <RefreshCw className="w-4 h-4 text-[#fbbf24]" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-[#07162c]/90 hover:bg-[#0b2545] border border-blue-800 rounded-xl text-white cursor-pointer transition-all shadow-md"
              title="Upload QR Image"
            >
              <Upload className="w-4 h-4 text-[#fbbf24]" />
            </button>
          </div>
        )}

        {/* Hidden File Input for Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Real-Time Scan Result HUD Banner */}
        {lastFeedback && lastFeedback.status && (
          <div
            className={`absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl border shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200 ${
              lastFeedback.status === 'success'
                ? 'bg-[#00205b]/95 text-blue-100 border-[#fbbf24]'
                : lastFeedback.status === 'duplicate'
                ? 'bg-amber-950/95 text-amber-100 border-amber-500'
                : 'bg-rose-950/95 text-rose-100 border-rose-500'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {lastFeedback.status === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-[#fbbf24] shrink-0" />
              ) : lastFeedback.status === 'duplicate' ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold truncate text-white">
                  {lastFeedback.studentName || 'Attendance Scan'}
                </div>
                <div className="text-[11px] opacity-90 truncate">{lastFeedback.message}</div>
              </div>
            </div>

            {lastFeedback.timeIn && (
              <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-black/40 text-[#fbbf24] shrink-0 border border-white/10">
                {lastFeedback.timeIn}
              </span>
            )}
          </div>
        )}

      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <ScanLine className="w-4 h-4 text-[#fbbf24]" />
          <span>Point device at student QR pass or upload QR screenshot.</span>
        </div>

        <div className="flex items-center gap-2">
          {isScanning ? (
            <button
              type="button"
              onClick={stopCamera}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium cursor-pointer transition-colors"
            >
              Pause Camera
            </button>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="py-1.5 px-3.5 bg-[#fbbf24] hover:bg-[#f59e0b] text-blue-950 font-bold rounded-xl cursor-pointer transition-colors"
            >
              Resume Camera
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-900 font-bold border border-slate-200 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload QR Image</span>
          </button>
        </div>
      </div>

    </div>
  );
};
