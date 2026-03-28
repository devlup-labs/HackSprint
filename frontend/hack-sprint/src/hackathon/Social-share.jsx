import React, { useState, useEffect } from "react";
import {
  Share2,
  Instagram,
  Linkedin,
  Link2,
  Heart,
  Github,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { API } from "../backendApis/api";

export const SocialShare = () => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isCheckingLike, setIsCheckingLike] = useState(true);
  const { id } = useParams();

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = "Check out this amazing hackathon!";

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem("token");
      if (!token || !id) {
        setIsCheckingLike(false);
        return;
      }
      try {
        const res = await API.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/hackathons/wishlist/check/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLiked(res.data.liked);
      } catch (err) {
        // console.error(err);
      } finally {
        setIsCheckingLike(false);
      }
    };
    check();
  }, [id]);

  const handleToggleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add hackathons to your wishlist");
      return;
    }
    if (!id) {
      toast.error("Hackathon ID not found");
      return;
    }
    try {
      const res = await API.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/hackathons/wishlist/toggle`,
        { hackathonId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setLiked(res.data.liked);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update wishlist");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // console.error(err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "HackSprint 🚀",
          text: shareText,
          url: currentUrl,
        });
      } catch (err) {
        // console.error(err);
      }
    } else {
      handleCopyLink();
    }
  };

  const shareUrls = {
    instagram:
      "https://www.instagram.com/hack.sprint?igsh=MWN6bjlldTV2Z2Nqdg==",
    github: "https://github.com/devlup-labs/HackSprint",
    linkedin: "https://www.linkedin.com/company/hacksprintiitj/",
  };

  const IconBtn = ({
    onClick,
    children,
    hoverBg = "hover:bg-[rgba(95,255,96,0.1)]",
    hoverShadow = "",
    disabled = false,
    active = false,
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-9 h-9 rounded-[3px] border flex items-center justify-center
        transition-all duration-150 cursor-pointer
        ${
          active
            ? "bg-[rgba(255,60,60,0.12)] border-[rgba(255,60,60,0.3)]"
            : `bg-[rgba(10,12,10,0.7)] border-[rgba(95,255,96,0.12)] ${hoverBg} hover:border-[rgba(95,255,96,0.3)]`
        }
        ${hoverShadow}
        disabled:opacity-40 disabled:cursor-wait
      `}
    >
      {children}
    </button>
  );

  /* ── divider ── */
  const Divider = () => (
    <div className="w-px h-6 bg-gradient-to-b from-transparent via-[rgba(95,255,96,0.15)] to-transparent" />
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');`}</style>

      <aside className="w-14 min-h-[calc(100vh-88px)] sticky top-[88px] shrink-0 font-[family-name:'JetBrains_Mono',monospace]">
        <div
          className="
          h-full py-6 flex flex-col items-center gap-4
          bg-[rgba(8,10,8,0.92)] backdrop-blur-xl
          border-l border-[rgba(95,255,96,0.08)]
        "
        >
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 cursor-pointer group"
          >
            <Share2
              size={15}
              className="text-[rgba(95,255,96,0.5)] group-hover:text-[#5fff60] transition-colors"
            />
            <span className="text-[0.45rem] tracking-[0.12em] uppercase text-[rgba(95,255,96,0.3)] group-hover:text-[rgba(95,255,96,0.6)] transition-colors">
              share
            </span>
          </button>

          <Divider />

          <div className="flex flex-col items-center gap-2">
            <IconBtn
              onClick={() => window.open(shareUrls.instagram, "_blank")}
              hoverBg="hover:bg-[rgba(225,48,108,0.1)]"
              hoverShadow="hover:shadow-[0_0_10px_rgba(225,48,108,0.2)]"
            >
              <Instagram
                size={14}
                className="text-[rgba(225,48,108,0.65)] group-hover:text-[rgb(225,48,108)]"
              />
            </IconBtn>

            <IconBtn
              onClick={() => window.open(shareUrls.github, "_blank")}
              hoverBg="hover:bg-[rgba(180,180,180,0.08)]"
              hoverShadow="hover:shadow-[0_0_10px_rgba(180,180,180,0.12)]"
            >
              <Github size={14} className="text-[rgba(200,200,200,0.6)]" />
            </IconBtn>

            <IconBtn
              onClick={() => window.open(shareUrls.linkedin, "_blank")}
              hoverBg="hover:bg-[rgba(10,102,194,0.1)]"
              hoverShadow="hover:shadow-[0_0_10px_rgba(10,102,194,0.2)]"
            >
              <Linkedin size={14} className="text-[rgba(10,102,194,0.7)]" />
            </IconBtn>

            <IconBtn
              onClick={handleCopyLink}
              hoverBg="hover:bg-[rgba(95,255,96,0.1)]"
              hoverShadow="hover:shadow-[0_0_10px_rgba(95,255,96,0.15)]"
            >
              <Link2
                size={14}
                className={`text-[rgba(95,255,96,0.55)] transition-all duration-200 ${
                  copied ? "rotate-12 scale-125 text-[#5fff60]" : ""
                }`}
              />
            </IconBtn>
          </div>

          {copied && (
            <span className="text-[0.45rem] tracking-[0.1em] uppercase text-[#5fff60] animate-pulse">
              copied
            </span>
          )}

          <Divider />

          {/* Like */}
          <div className="flex flex-col items-center gap-1">
            <IconBtn
              onClick={handleToggleLike}
              disabled={isCheckingLike}
              active={liked}
              hoverBg="hover:bg-[rgba(255,60,60,0.1)]"
              hoverShadow="hover:shadow-[0_0_10px_rgba(255,60,60,0.18)]"
            >
              <Heart
                size={14}
                className={`transition-all duration-200 ${
                  liked
                    ? "text-[#ff6060] fill-[#ff6060] scale-110"
                    : "text-[rgba(255,96,96,0.5)]"
                }`}
              />
            </IconBtn>
            {liked && (
              <span className="text-[0.45rem] tracking-[0.1em] uppercase text-[rgba(255,96,96,0.6)]">
                liked
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
