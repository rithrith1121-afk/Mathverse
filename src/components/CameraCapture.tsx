import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, ZapOff } from 'lucide-react';

type CameraCaptureProps = {
  onCapture: (file: File) => void;
  onClose: () => void;
};

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [permError, setPermError] = useState('');
  const [starting, setStarting] = useState(true);

  // Start camera on mount
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((mediaStream) => {
        activeStream = mediaStream;
        setStream(mediaStream);
        setStarting(false);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(() => {
        setPermError('Camera access denied. Please allow camera permission in your browser settings.');
        setStarting(false);
      });

    return () => {
      if (activeStream) activeStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Stop stream when modal closes
  const handleClose = useCallback(() => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    onClose();
  }, [stream, onClose]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture_${Date.now()}.png`, { type: 'image/png' });
      const previewUrl = URL.createObjectURL(file);
      setCapturedFile(file);
      setCapturedUrl(previewUrl);
      // Pause stream preview (keep stream alive for retake)
      if (videoRef.current) videoRef.current.pause();
    }, 'image/png');
  };

  const handleRetake = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedFile(null);
    if (videoRef.current) videoRef.current.play();
  };

  const handleUsePhoto = () => {
    if (!capturedFile) return;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    onCapture(capturedFile);
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0a0e1a] border border-cyan-500/20 rounded-2xl shadow-[0_0_60px_rgba(0,210,255,0.15)] overflow-hidden flex flex-col">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-mono uppercase tracking-wider text-cyan-300">Camera Capture</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Body */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[300px]">

          {/* Starting spinner */}
          {starting && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Initializing camera...</p>
            </div>
          )}

          {/* Permission error */}
          {permError && !starting && (
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <ZapOff className="w-8 h-8 text-red-400" />
              <p className="text-sm text-red-300">{permError}</p>
            </div>
          )}

          {/* Live preview (hidden when captured) */}
          {!permError && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full max-h-[380px] object-cover ${capturedUrl ? 'hidden' : 'block'}`}
            />
          )}

          {/* Captured preview */}
          {capturedUrl && (
            <img
              src={capturedUrl}
              alt="Captured math problem"
              className="w-full max-h-[380px] object-contain"
            />
          )}
        </div>

        {/* Controls */}
        {!permError && !starting && (
          <div className="flex items-center justify-center gap-3 px-5 py-4 border-t border-slate-800/60 bg-[#0a0e1a]">
            {!capturedUrl ? (
              // Before capture: just Capture button
              <button
                type="button"
                onClick={capturePhoto}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-mono font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,210,255,0.35)] cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Capture
              </button>
            ) : (
              // After capture: Retake + Use Photo
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-sm transition-all cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleUsePhoto}
                  className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-mono font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,210,255,0.35)] cursor-pointer"
                >
                  ✓ Use Photo
                </button>
              </>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
