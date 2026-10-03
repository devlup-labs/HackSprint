import React, { useEffect, useRef, useState } from "react";
import "../pages/Styles/AllHackathons.css";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Camera, RefreshCw, X, Check } from "lucide-react";

// Self-contained webcam/camera capture modal. Requests getUserMedia on
// mount, lets the user snap a still frame, review it, retake, or confirm —
// then hands the caller a real File (image/jpeg) so it can be dropped
// straight into any existing file-upload pipeline unchanged.
const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [capturedUrl, setCapturedUrl] = useState(null);
  const capturedBlobRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't access your camera. Check permissions and try again.");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // The preview is mirrored (-scale-x-100) so it feels like a mirror —
    // flip the capture to match what the user actually saw, otherwise the
    // saved photo comes out reversed compared to the preview.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Couldn't capture photo. Please try again.");
          return;
        }
        capturedBlobRef.current = blob;
        setCapturedUrl(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.92
    );
  };

  const handleRetake = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    capturedBlobRef.current = null;
  };

  const handleUsePhoto = () => {
    if (!capturedBlobRef.current) return;
    const file = new File([capturedBlobRef.current], `avatar-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    onCapture(file);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-[family-name:'JetBrains_Mono',monospace]">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[rgb(var(--hk-card-bg))] border border-[rgba(var(--hk-card-border-rgb),0.32)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)] rounded-[4px] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-[0.95rem]">
            Take a Photo
          </h3>
          <button
            onClick={onClose}
            className="text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)] hover:text-[var(--hk-text)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative w-full aspect-square rounded-[3px] overflow-hidden bg-black border border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)]">
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-[0.7rem] text-[rgba(255,144,144,0.85)]">
              {error}
            </div>
          )}
          {/* Kept permanently mounted so the camera stream stays attached —
              swapping it in/out on retake would drop srcObject and leave a
              black screen behind the "live" state. */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
          {capturedUrl && (
            <img
              src={capturedUrl}
              alt="Captured preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {capturedUrl ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-[0.62rem] tracking-[0.08em] uppercase px-3 py-2 rounded-[3px] border border-[rgba(var(--hk-card-border-rgb),0.4)] dark:border-[rgba(var(--hk-card-border-rgb),0.25)] text-[var(--hk-accent-solid)] bg-[rgba(var(--hk-accent-rgb),0.08)] hover:bg-[rgba(var(--hk-accent-rgb),0.15)] transition-all cursor-pointer"
              >
                <RefreshCw size={12} /> Retake
              </button>
              <button
                onClick={handleUsePhoto}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-[0.62rem] tracking-[0.08em] uppercase px-3 py-2 rounded-[3px] border border-[var(--hk-accent-solid)] bg-[var(--hk-accent-solid)] text-[#050905] font-bold hover:bg-[#7fff80] transition-all cursor-pointer"
              >
                <Check size={12} /> Use Photo
              </button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              disabled={!!error}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-[0.62rem] tracking-[0.08em] uppercase px-3 py-2 rounded-[3px] border border-[var(--hk-accent-solid)] bg-[var(--hk-accent-solid)] text-[#050905] font-bold hover:bg-[#7fff80] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Camera size={12} /> Capture
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CameraCapture;
