import React, { useRef, useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { extractTextFromImage } from '../services/ocrService';

type CameraCaptureProps = {
  onExtract: (text: string) => void;
};

export default function CameraCapture({ onExtract }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (capturing) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) videoRef.current.srcObject = mediaStream;
        })
        .catch((err) => setError('Camera access denied'));
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [capturing]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'capture.png', { type: 'image/png' });
      try {
        const text = await extractTextFromImage(file);
        onExtract(text);
      } catch (e) {
        setError('Failed to extract text');
      }
    }, 'image/png');
    setCapturing(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {capturing ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-w-full rounded-md"
          />
          <button
            type="button"
            onClick={capturePhoto}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-cyan-600 text-white px-3 py-1 rounded-md flex items-center gap-1"
          >
            <Camera className="w-4 h-4" /> Capture
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCapturing(true)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-md"
        >
          <Camera className="w-4 h-4" /> Open Camera
        </button>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
