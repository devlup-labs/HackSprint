import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Play,
} from "lucide-react";
import { createPortal } from "react-dom";
import { API as axiosAPI } from "../backendApis/api.js";

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
    .font-jb   { font-family: 'JetBrains Mono', monospace; }
    .font-syne { font-family: 'Syne', sans-serif; }
    .agm-card::before, .agm-card::after {
      content: ''; position: absolute;
      width: 9px; height: 9px; border-style: solid;
      border-color: rgba(95,255,96,.45);
    }
    .agm-card::before { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
    .agm-card::after  { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
    .agm-thumb-strip::-webkit-scrollbar { display: none; }
    @keyframes agm-spin { to { transform: rotate(360deg); } }
    .agm-spin { animation: agm-spin .7s linear infinite; }
  `}</style>
);

const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
const API = (id, path = "") =>
  `${import.meta.env.VITE_API_BASE_URL}/api/hackathons/${id}/gallery${path}`;

const LazyMedia = ({ url, alt, className }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {visible &&
        (isVideo(url) ? (
          <video
            src={url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={url}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ))}
    </div>
  );
};

const Lightbox = ({ items, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex);
  const [loaded, setLoaded] = useState(false);
  const thumbsRef = useRef(null);

  const prev = () => {
    setLoaded(false);
    setIndex((i) => (i - 1 + items.length) % items.length);
  };
  const next = () => {
    setLoaded(false);
    setIndex((i) => (i + 1) % items.length);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [index]);

  useEffect(() => {
    if (!thumbsRef.current) return;
    const active = thumbsRef.current.querySelector("[data-active='true']");
    if (active)
      active.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  }, [index]);

  const url = items[index];

  return createPortal(
    <div className="font-jb fixed inset-0 z-50 flex flex-col bg-[rgba(0,0,0,0.96)] backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-[0.65rem] flex-shrink-0 border-b border-[rgba(95,255,96,0.1)]">
        <div className="flex items-center gap-[0.6rem]">
          <span className="text-[0.55rem] tracking-[0.18em] uppercase text-[rgba(95,255,96,0.4)]">
            Gallery
          </span>
          <span className="w-px h-3.5 bg-[rgba(95,255,96,0.15)]" />
          <span className="text-[0.62rem] text-[rgba(180,220,180,0.55)]">
            {index + 1} / {items.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-[0.35rem] px-[0.7rem] py-[0.3rem] rounded-[3px] border border-[rgba(95,255,96,0.15)] bg-[rgba(95,255,96,0.05)] text-[rgba(95,255,96,0.5)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.35)] text-[0.6rem] tracking-[0.08em] uppercase transition-all cursor-pointer"
        >
          <X size={12} /> Close
        </button>
      </div>

      {/* Main image area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 px-16 py-6">
        {items.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-3 z-10 p-[0.5rem] rounded-[3px] border border-[rgba(95,255,96,0.15)] bg-[rgba(95,255,96,0.05)] text-[rgba(95,255,96,0.45)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.35)] transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="relative flex items-center justify-center w-full h-full">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="agm-spin w-7 h-7 border-2 border-[rgba(95,255,96,0.15)] border-t-[#5fff60] rounded-full" />
            </div>
          )}
          {isVideo(url) ? (
            <video
              key={url}
              src={url}
              controls
              autoPlay
              onLoadedData={() => setLoaded(true)}
              className="max-w-full max-h-full rounded-[3px]"
              style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.25s" }}
            />
          ) : (
            <img
              key={url}
              src={url}
              alt=""
              onLoad={() => setLoaded(true)}
              className="max-w-full max-h-full object-contain rounded-[3px]"
              style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.25s" }}
            />
          )}
        </div>

        {items.length > 1 && (
          <button
            onClick={next}
            className="absolute right-3 z-10 p-[0.5rem] rounded-[3px] border border-[rgba(95,255,96,0.15)] bg-[rgba(95,255,96,0.05)] text-[rgba(95,255,96,0.45)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.35)] transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {items.length > 1 && (
        <div className="flex-shrink-0 border-t border-[rgba(95,255,96,0.08)] px-4 py-[0.65rem]">
          <div
            ref={thumbsRef}
            className="agm-thumb-strip flex gap-[0.4rem] overflow-x-auto pb-1"
          >
            {items.map((thumbUrl, i) => (
              <button
                key={i}
                data-active={i === index ? "true" : "false"}
                onClick={() => {
                  setLoaded(false);
                  setIndex(i);
                }}
                className="flex-shrink-0 w-12 h-12 rounded-[2px] overflow-hidden cursor-pointer transition-all duration-200 border"
                style={{
                  borderColor:
                    i === index
                      ? "rgba(95,255,96,0.8)"
                      : "rgba(95,255,96,0.12)",
                  opacity: i === index ? 1 : 0.4,
                }}
              >
                {isVideo(thumbUrl) ? (
                  <div className="w-full h-full bg-[rgba(95,255,96,0.06)] flex items-center justify-center">
                    <Play size={14} className="text-[rgba(95,255,96,0.5)]" />
                  </div>
                ) : (
                  <img
                    src={thumbUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

const AdminGalleryManager = ({ hackathonId }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    axiosAPI
      .get(API(hackathonId))
      .then(({ data }) => {
        if (!cancelled && data.success) setGallery(data.gallery || []);
      })
      .catch(console.log("Error"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hackathonId]);

  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const handleFiles = useCallback((selected) => {
    const valid = selected.slice(0, 10);
    if (selected.length > 10) toast.warn("Only first 10 images will be used");
    setFiles(valid);
    setPreviews(valid.map((f) => URL.createObjectURL(f)));
  }, []);

  const clearSelection = () => {
    setFiles([]);
    setPreviews([]);
  };

  const handleUpload = async () => {
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((f) => formData.append("image", f));
    setUploading(true);
    try {
      const { data } = await axiosAPI.post(API(hackathonId), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      toast.success(`${files.length} image(s) uploaded!`);
      setGallery(data.gallery);
      clearSelection();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageUrl) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      const { data } = await axiosAPI.delete(API(hackathonId), {
        data: { imageUrl },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setGallery(data.gallery);
      if (lightboxIndex !== null && lightboxIndex >= data.gallery.length)
        setLightboxIndex(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <FontStyle />
      <div className="font-jb flex flex-col gap-[1.25rem]">
        <div className="agm-card relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.12)] rounded-[4px] backdrop-blur-[14px] p-[1.5rem] flex flex-col gap-[1rem]">
          {/* heading */}
          <div className="flex items-center gap-[0.5rem]">
            <Upload size={14} className="text-[#5fff60]" />
            <span className="font-syne text-[0.95rem] font-extrabold text-white tracking-tight">
              Upload Images
            </span>
          </div>

          {/* drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(
                Array.from(e.dataTransfer.files).filter((f) =>
                  f.type.startsWith("image/")
                )
              );
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-[0.5rem] h-[8rem] border rounded-[3px] cursor-pointer transition-all duration-200
              ${
                dragging
                  ? "border-[#5fff60] bg-[rgba(95,255,96,0.07)]"
                  : "border-dashed border-[rgba(95,255,96,0.2)] bg-[rgba(95,255,96,0.03)] hover:border-[rgba(95,255,96,0.38)] hover:bg-[rgba(95,255,96,0.06)]"
              }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(Array.from(e.target.files))}
            />
            <CloudUpload
              size={22}
              className={`transition-colors ${
                dragging ? "text-[#5fff60]" : "text-[rgba(95,255,96,0.3)]"
              }`}
            />
            <div className="text-center">
              <p className="text-[0.7rem] text-[rgba(180,220,180,0.6)]">
                Drop images or <span className="text-[#5fff60]">browse</span>
              </p>
              <p className="text-[0.58rem] text-[rgba(120,160,120,0.38)] mt-[0.15rem] tracking-[0.05em]">
                MAX 10 IMAGES · JPEG, PNG, WEBP
              </p>
            </div>
          </div>

          {/* preview strip */}
          {previews.length > 0 && (
            <div className="flex flex-col gap-[0.5rem]">
              <div className="flex items-center justify-between">
                <span className="text-[0.6rem] text-[rgba(180,220,180,0.45)] tracking-[0.06em]">
                  {files.length} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="inline-flex items-center gap-[0.3rem] text-[0.58rem] tracking-[0.06em] uppercase text-[rgba(255,80,80,0.55)] hover:text-[#ff6060] transition-colors cursor-pointer"
                >
                  <X size={10} /> Clear
                </button>
              </div>
              <div className="flex gap-[0.4rem] flex-wrap">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-[2px] overflow-hidden bg-[rgba(95,255,96,0.06)] border border-[rgba(95,255,96,0.12)] flex-shrink-0"
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !files.length}
            className="font-jb self-start inline-flex items-center gap-[0.4rem] text-[0.65rem] tracking-[0.1em] uppercase px-[1.1rem] py-[0.55rem] rounded-[3px] border cursor-pointer transition-all duration-150
              bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold
              hover:bg-[#7fff80] hover:shadow-[0_0_18px_rgba(95,255,96,0.28)]
              disabled:bg-[rgba(95,255,96,0.18)] disabled:border-[rgba(95,255,96,0.18)] disabled:text-[rgba(95,255,96,0.35)] disabled:cursor-not-allowed disabled:shadow-none"
          >
            {uploading ? (
              <>
                <div className="agm-spin w-[12px] h-[12px] border-2 border-[rgba(5,9,5,0.25)] border-t-[#050905] rounded-full" />{" "}
                Uploading…
              </>
            ) : (
              <>
                <Upload size={12} /> Upload
              </>
            )}
          </button>
        </div>

        <div className="agm-card relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.12)] rounded-[4px] backdrop-blur-[14px] p-[1.5rem] flex flex-col gap-[1rem]">
          {/* heading */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[0.5rem]">
              <ImageIcon size={14} className="text-[#5fff60]" />
              <span className="font-syne text-[0.95rem] font-extrabold text-white tracking-tight">
                Gallery
              </span>
            </div>
            {gallery.length > 0 && (
              <span className="font-jb text-[0.58rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.45)] border border-[rgba(95,255,96,0.15)] px-[0.55rem] py-[0.18rem] rounded-[2px]">
                {gallery.length} items
              </span>
            )}
          </div>

          {/* states */}
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="agm-spin w-7 h-7 border-2 border-[rgba(95,255,96,0.15)] border-t-[#5fff60] rounded-full" />
            </div>
          ) : gallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-[0.5rem] py-12">
              <ImageIcon size={36} className="text-[rgba(95,255,96,0.12)]" />
              <p className="font-jb text-[0.62rem] text-[rgba(120,160,120,0.38)] tracking-[0.08em] uppercase">
                No images yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[0.6rem]">
              {gallery.map((url, i) => (
                <div
                  key={i}
                  className="relative group aspect-square bg-[rgba(95,255,96,0.05)] border border-[rgba(95,255,96,0.08)] rounded-[3px] overflow-hidden cursor-pointer"
                >
                  <LazyMedia url={url} alt="" className="w-full h-full" />

                  {isVideo(url) && (
                    <div
                      className="absolute top-[0.35rem] left-[0.35rem] pointer-events-none
                      font-jb inline-flex items-center gap-[0.25rem] text-[0.5rem] tracking-[0.08em] uppercase
                      px-[0.4rem] py-[0.15rem] rounded-[2px] bg-[rgba(0,0,0,0.7)] text-[rgba(95,255,96,0.7)] border border-[rgba(95,255,96,0.2)]"
                    >
                      <Play size={9} /> Video
                    </div>
                  )}

                  {/* hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 [@media(hover:none)]:bg-black/45 transition-all duration-200 flex items-center justify-center gap-[0.5rem]">
                    {/* view */}
                    <button
                      onClick={() => setLightboxIndex(i)}
                      className="opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity
                        p-[0.45rem] rounded-[2px] border border-[rgba(95,255,96,0.3)] bg-[rgba(95,255,96,0.1)] text-[#5fff60]
                        hover:bg-[rgba(95,255,96,0.2)] cursor-pointer"
                    >
                      <ImageIcon size={14} />
                    </button>
                    {/* delete */}
                    <button
                      onClick={() => handleDelete(url)}
                      className="opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity
                        p-[0.45rem] rounded-[2px] border border-[rgba(255,60,60,0.3)] bg-[rgba(255,60,60,0.15)] text-[#ff9090]
                        hover:bg-[rgba(255,60,60,0.28)] cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <Lightbox
            items={gallery}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </div>
    </>
  );
};

export default AdminGalleryManager;
