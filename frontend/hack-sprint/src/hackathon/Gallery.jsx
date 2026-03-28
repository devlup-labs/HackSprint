import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon,
  Play,
} from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { API } from "../backendApis/api";

const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

const NavBtn = ({ onClick, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center w-9 h-9 rounded-[3px] border bg-[rgba(10,12,10,0.88)] border-[rgba(95,255,96,0.2)] text-[rgba(95,255,96,0.6)] hover:bg-[rgba(95,255,96,0.08)] hover:border-[rgba(95,255,96,0.42)] hover:text-[#5fff60] transition-all cursor-pointer ${className}`}
  >
    {children}
  </button>
);

const Gallery = () => {
  const { id: hackathonId } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imagesPerSlide, setImagesPerSlide] = useState(3);

  const totalSlides = Math.max(1, Math.ceil(images.length / imagesPerSlide));
  const startIdx = currentIndex * imagesPerSlide;
  const visible = images.slice(startIdx, startIdx + imagesPerSlide);
  const currentFile = images[lightboxIndex];

  useEffect(() => {
    API
      .get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/hackathons/${hackathonId}/gallery`
      )
      .then((r) => {
        if (r.data.success) setImages(r.data.gallery || []);
      })
      .catch()
      .finally(() => setLoading(false));
  }, [hackathonId]);

  useEffect(() => {
    const handle = () => setImagesPerSlide(window.innerWidth < 768 ? 1 : 3);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [imagesPerSlide]);

  useEffect(() => {
    const onKey = (e) => {
      if (!showLightbox) return;
      if (e.key === "ArrowLeft")
        setLightboxIndex((p) => (p === 0 ? images.length - 1 : p - 1));
      if (e.key === "ArrowRight")
        setLightboxIndex((p) => (p + 1) % images.length);
      if (e.key === "Escape") setShowLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLightbox, images.length]);

  useEffect(() => {
    document.body.style.overflow = showLightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showLightbox]);

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setShowLightbox(true);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 gap-3 font-[family-name:'JetBrains_Mono',monospace]">
        <div className="w-7 h-7 rounded-full border-2 border-[rgba(95,255,96,0.15)] border-t-[#5fff60] animate-spin" />
        <span className="text-[0.62rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.35)]">
          Loading gallery…
        </span>
      </div>
    );

  if (images.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 font-[family-name:'JetBrains_Mono',monospace]">
        <div className="relative w-12 h-12 rounded-[3px] bg-[rgba(95,255,96,0.05)] border border-[rgba(95,255,96,0.12)] flex items-center justify-center">
          <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.3)]" />
          <ImageIcon size={20} className="text-[rgba(95,255,96,0.2)]" />
        </div>
        <p className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-sm tracking-tight">
          No gallery yet
        </p>
        <p className="text-[0.6rem] text-[rgba(180,220,180,0.3)]">
          Check back later for event photos!
        </p>
      </div>
    );

  return (
    <>
      <div className="flex flex-col gap-5 font-[family-name:'JetBrains_Mono',monospace]">
        <div>
          <h2 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-2xl tracking-tight mb-1">
            Glimpse from event
          </h2>
          <p className="text-[0.62rem] text-[rgba(180,220,180,0.4)] tracking-[0.04em]">
            Photos and videos from the hackathon
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {visible.map((file, idx) => {
              const actualIdx = startIdx + idx;
              const vid = isVideo(file);
              return (
                <div
                  key={actualIdx}
                  onClick={() => openLightbox(actualIdx)}
                  className="relative group overflow-hidden rounded-[4px] border border-[rgba(95,255,96,0.1)] hover:border-[rgba(95,255,96,0.3)] aspect-video bg-[rgba(10,12,10,0.7)] cursor-pointer transition-all"
                >
                  <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.35)] z-10" />
                  <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(95,255,96,0.35)] z-10" />

                  {vid ? (
                    <>
                      <video
                        src={file}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                        <div className="w-10 h-10 rounded-[3px] bg-[rgba(95,255,96,0.15)] border border-[rgba(95,255,96,0.3)] flex items-center justify-center">
                          <Play
                            size={16}
                            className="text-[#5fff60] ml-0.5"
                            fill="currentColor"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={file}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {images.length > imagesPerSlide && (
            <>
              <NavBtn
                onClick={() =>
                  setCurrentIndex((p) => (p === 0 ? totalSlides - 1 : p - 1))
                }
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10"
              >
                <ChevronLeft size={16} />
              </NavBtn>
              <NavBtn
                onClick={() => setCurrentIndex((p) => (p + 1) % totalSlides)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10"
              >
                <ChevronRight size={16} />
              </NavBtn>
            </>
          )}
        </div>

        {images.length > imagesPerSlide && (
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? "w-6 bg-[#5fff60]"
                    : "w-1.5 bg-[rgba(95,255,96,0.2)] hover:bg-[rgba(95,255,96,0.4)]"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {showLightbox &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setShowLightbox(false)}
          >
            <div
              className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6 z-50">
                <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] tracking-[0.1em] text-[rgba(95,255,96,0.5)]">
                  {lightboxIndex + 1} / {images.length}
                </span>
                <button
                  onClick={() => setShowLightbox(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-[3px] border border-[rgba(95,255,96,0.2)] bg-[rgba(10,12,10,0.8)] text-[rgba(95,255,96,0.5)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.45)] transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="w-full h-[75vh] flex items-center justify-center">
                {isVideo(currentFile) ? (
                  <video
                    src={currentFile}
                    controls
                    autoPlay
                    className="max-h-full max-w-full rounded-[4px] border border-[rgba(95,255,96,0.15)]"
                  />
                ) : (
                  <img
                    src={currentFile}
                    alt=""
                    className="max-h-full max-w-full object-contain rounded-[4px] border border-[rgba(95,255,96,0.12)]"
                  />
                )}
              </div>

              <NavBtn
                onClick={() =>
                  setLightboxIndex((p) => (p === 0 ? images.length - 1 : p - 1))
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10"
              >
                <ChevronLeft size={18} />
              </NavBtn>
              <NavBtn
                onClick={() => setLightboxIndex((p) => (p + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10"
              >
                <ChevronRight size={18} />
              </NavBtn>

              <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-x-auto">
                {images.map((file, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className={`flex-shrink-0 w-12 h-8 rounded-[2px] overflow-hidden border transition-all cursor-pointer ${
                      i === lightboxIndex
                        ? "border-[rgba(95,255,96,0.55)] opacity-100"
                        : "border-[rgba(95,255,96,0.1)] opacity-50 hover:opacity-80"
                    }`}
                  >
                    {isVideo(file) ? (
                      <div className="w-full h-full bg-[rgba(95,255,96,0.08)] flex items-center justify-center">
                        <Play size={10} className="text-[#5fff60]" />
                      </div>
                    ) : (
                      <img
                        src={file}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Gallery;
