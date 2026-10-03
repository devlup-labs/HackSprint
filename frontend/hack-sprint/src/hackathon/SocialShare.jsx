import React, { useCallback, useEffect, useState } from "react";
import {
  Share2,
  Instagram,
  Linkedin,
  Link2,
  Heart,
  X,
  ArrowRight,
  Check,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { HackathonAPI } from "../api/hackathon.api.js";
import "../pages/Styles/AllHackathons.css";

export const SocialShare = ({ hackathonId: id }) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isCheckingLike, setIsCheckingLike] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareText = "Check out this event on HackSprint! 🚀";

  /* =========================================================
     MOUNT CHECK FOR PORTAL
  ========================================================= */

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /* =========================================================
     CHECK WISHLIST
  ========================================================= */

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem("token");

      if (!token || !id) {
        setIsCheckingLike(false);
        return;
      }

      try {
        const res = await HackathonAPI.checkWishlist(id);
        setLiked(res.data.liked);
      } catch (err) {
        console.error("Wishlist check failed:", err);
      } finally {
        setIsCheckingLike(false);
      }
    };

    check();
  }, [id]);

  /* =========================================================
     TOGGLE WISHLIST
  ========================================================= */

  const handleToggleLike = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to add events to your wishlist");
      return;
    }

    if (!id) {
      toast.error("Event ID not found");
      return;
    }

    try {
      const res = await HackathonAPI.toggleWishlist({
        hackathonId: id,
      });

      if (res.data.success) {
        setLiked(res.data.liked);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update wishlist");
    }
  };

  /* =========================================================
     COPY URL
  ========================================================= */

  const copyCurrentUrl = useCallback(
    async (showToast = false) => {
      if (!currentUrl) return;

      try {
        await navigator.clipboard.writeText(currentUrl);

        setCopied(true);

        if (showToast) {
          toast.success("Event link copied");
        }

        setTimeout(() => {
          setCopied(false);
        }, 2500);
      } catch (err) {
        console.error("Failed to copy URL:", err);

        if (showToast) {
          toast.error("Unable to copy link");
        }
      }
    },
    [currentUrl]
  );

  /* =========================================================
     OPEN / CLOSE MODAL
  ========================================================= */

  const openShareModal = useCallback(() => {
    setShareOpen(true);

    if (!currentUrl) return;

    navigator.clipboard
      ?.writeText(currentUrl)
      .then(() => {
        setCopied(true);
      })
      .catch(() => {
        setCopied(false);
      });
  }, [currentUrl]);

  const closeShareModal = useCallback(() => {
    setShareOpen(false);
  }, []);

  /* =========================================================
     FULL PAGE SCROLL LOCK

     This prevents:
     - body scrolling
     - html scrolling
     - scrollbar movement
     - background jumping
     - touch scrolling
  ========================================================= */

  useEffect(() => {
    if (!shareOpen) return;

    const scrollY = window.scrollY;

    const body = document.body;
    const html = document.documentElement;

    const previousBodyStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    const previousHtmlOverflow = html.style.overflow;

    /*
      Fix body at current scroll position.

      This is stronger than only:
      document.body.style.overflow = "hidden"
    */

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    html.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeShareModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.overflow = previousBodyStyles.overflow;
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.left = previousBodyStyles.left;
      body.style.right = previousBodyStyles.right;
      body.style.width = previousBodyStyles.width;

      html.style.overflow = previousHtmlOverflow;

      window.removeEventListener("keydown", handleKeyDown);

      window.scrollTo(0, scrollY);
    };
  }, [shareOpen, closeShareModal]);

  /* =========================================================
     SHARE HANDLERS
  ========================================================= */

  const handleWhatsAppShare = () => {
    const text = `${shareText}\n${currentUrl}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleInstagramShare = async () => {
    await copyCurrentUrl(false);

    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =========================================================
     REUSABLE ICON BUTTON
  ========================================================= */

  const IconBtn = ({
    onClick,
    children,
    hoverBg = "hover:bg-[rgba(var(--hk-accent-rgb),0.1)]",
    hoverShadow = "",
    disabled = false,
    active = false,
    ariaLabel,
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        group
        w-9 h-9
        rounded-[4px]
        border
        flex
        items-center
        justify-center
        transition-all
        duration-200
        cursor-pointer

        ${
          active
            ? `
              bg-[rgba(255,60,60,0.12)]
              border-[rgba(255,60,60,0.3)]
            `
            : `
              bg-[rgba(var(--hk-card-bg),0.7)]
              border-[rgba(var(--hk-card-border-rgb),0.18)]
              dark:border-[rgba(var(--hk-card-border-rgb),0.12)]
              ${hoverBg}
              hover:border-[rgba(var(--hk-accent-rgb),0.3)]
            `
        }

        ${hoverShadow}

        hover:-translate-y-[1px]
        active:translate-y-0
        active:scale-95

        disabled:opacity-40
        disabled:cursor-wait
      `}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div
      className="
        w-px
        h-6
        bg-gradient-to-b
        from-transparent
        via-[rgba(var(--hk-accent-rgb),0.15)]
        to-transparent
      "
    />
  );

  /* =========================================================
     SHARE OPTIONS
  ========================================================= */

  const shareOptions = [
    {
      label: "WhatsApp",
      description: "Share with a link preview",
      icon: FaWhatsapp,
      action: handleWhatsAppShare,
      brand: "#25D366",
    },
    {
      label: "Instagram",
      description: "Link copied — paste into a story or DM",
      icon: Instagram,
      action: handleInstagramShare,
      brand: "#E1306C",
    },
    {
      label: "LinkedIn",
      description: "Share this event as a post",
      icon: Linkedin,
      action: handleLinkedInShare,
      brand: "#0A66C2",
    },
  ];

  /* =========================================================
     MODAL
     Rendered directly into document.body using createPortal
  ========================================================= */

  const ShareModal = () => {
    if (!mounted) return null;

    return createPortal(
      <AnimatePresence>
        {shareOpen && (
          <motion.div
            key="share-modal"
            className="
              fixed
              inset-0
              z-[2147483647]

              flex
              items-center
              justify-center

              p-4
              sm:p-5

              overflow-hidden
              overscroll-none
            "
          >
            {/* ================= OVERLAY ================= */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeShareModal}
              className="
                absolute
                inset-0

                bg-black/80
                backdrop-blur-[6px]
              "
            />

            {/* ================= MODAL ================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 28,
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-modal-title"
              onClick={(event) => event.stopPropagation()}
              className="
                relative
                z-[1]

                font-[family-name:'JetBrains_Mono',monospace]

                w-full
                max-w-[460px]

                max-h-[calc(100dvh-32px)]

                bg-[var(--hk-bg)]

                border
                border-[rgba(var(--hk-accent-rgb),0.22)]

                rounded-[4px]

                shadow-[0_0_80px_rgba(0,0,0,0.75)]

                overflow-hidden
              "
            >
              {/* TOP GLOW */}

              <div
                className="
                  pointer-events-none
                  absolute
                  top-0
                  left-1/2
                  -translate-x-1/2

                  w-[70%]
                  h-[1px]

                  bg-[var(--hk-accent-solid)]

                  shadow-[0_0_30px_rgba(var(--hk-accent-rgb),0.65)]
                "
              />

              <div
                className="
                  p-5
                  sm:p-6

                  max-h-[calc(100dvh-32px)]
                  overflow-y-auto
                  overscroll-contain
                "
              >
                {/* ================= HEADER ================= */}

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                    mb-6
                  "
                >
                  <div>
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        mb-1
                      "
                    >
                      <Share2 size={15} className="text-[var(--hk-accent-solid)]" />

                      <span
                        className="
                          text-[10px]
                          uppercase
                          tracking-[0.18em]
                          text-[rgba(var(--hk-accent-rgb),0.6)]
                          font-mono
                        "
                      >
                        HackSprint
                      </span>
                    </div>

                    <h2
                      id="share-modal-title"
                      className="
                        font-[family-name:'Syne',sans-serif]
                        text-[var(--hk-text)]
                        text-xl
                        sm:text-[22px]
                        font-extrabold
                        tracking-[-0.02em]
                      "
                    >
                      Share this event
                    </h2>

                    <p
                      className="
                        text-[rgba(var(--hk-text-rgb),0.4)]
                        text-xs
                        sm:text-sm
                        mt-1
                      "
                    >
                      Send it anywhere in one tap
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeShareModal}
                    aria-label="Close"
                    className="
                      w-9
                      h-9
                      shrink-0

                      rounded-full

                      border
                      border-[rgba(var(--hk-text-rgb),0.1)]

                      flex
                      items-center
                      justify-center

                      text-[rgba(var(--hk-text-rgb),0.55)]

                      hover:text-[var(--hk-accent-solid)]
                      hover:border-[rgba(var(--hk-accent-rgb),0.35)]
                      hover:bg-[rgba(var(--hk-accent-rgb),0.05)]

                      active:scale-95

                      transition-all
                      duration-200
                    "
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* ================= SHARE OPTIONS ================= */}

                <div className="flex flex-col gap-2.5">
                  {shareOptions.map(
                    ({ label, description, icon: Icon, action, brand }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={action}
                        style={{ "--brand": brand }}
                        className="
                          group

                          w-full

                          flex
                          items-center
                          gap-3.5

                          px-3.5
                          sm:px-4
                          py-3

                          rounded-[4px]

                          border
                          border-[rgba(var(--hk-text-rgb),0.07)]

                          bg-[rgba(var(--hk-text-rgb),0.02)]

                          text-left

                          hover:bg-[var(--brand)]/[0.06]
                          hover:border-[var(--brand)]/25

                          active:scale-[0.99]

                          transition-all
                          duration-200
                        "
                      >
                        <span
                          className="
                            w-10
                            h-10
                            shrink-0

                            rounded-full

                            border
                            border-[rgba(var(--hk-text-rgb),0.1)]

                            flex
                            items-center
                            justify-center

                            text-[rgba(var(--hk-text-rgb),0.65)]

                            group-hover:text-[var(--brand)]
                            group-hover:border-[var(--brand)]/30
                            group-hover:bg-[var(--brand)]/5

                            transition-all
                            duration-200
                          "
                        >
                          <Icon size={16} />
                        </span>

                        <span className="flex-1 min-w-0">
                          <span
                            className="
                              block
                              text-[13px]
                              sm:text-sm
                              font-semibold
                              text-[rgba(var(--hk-text-rgb),0.9)]
                            "
                          >
                            {label}
                          </span>

                          <span
                            className="
                              block
                              mt-[2px]

                              text-[10px]
                              sm:text-[11px]

                              text-[rgba(var(--hk-text-rgb),0.35)]

                              truncate
                            "
                          >
                            {description}
                          </span>
                        </span>

                        <ArrowRight
                          size={15}
                          className="
                            shrink-0
                            text-[rgba(var(--hk-text-rgb),0.25)]

                            group-hover:text-[var(--hk-accent-solid)]
                            group-hover:translate-x-1

                            transition-all
                            duration-200
                          "
                        />
                      </button>
                    )
                  )}
                </div>

                {/* ================= URL ================= */}

                <div
                  className="
                    mt-5

                    flex
                    items-center
                    gap-2.5

                    min-w-0

                    px-3
                    py-3

                    rounded-[4px]

                    border
                    border-dashed
                    border-[rgba(var(--hk-accent-rgb),0.2)]

                    bg-[rgba(var(--hk-accent-rgb),0.025)]
                  "
                >
                  <Link2
                    size={14}
                    className="
                      shrink-0
                      text-[rgba(var(--hk-accent-rgb),0.45)]
                    "
                  />

                  <span
                    title={currentUrl}
                    className="
                      flex-1
                      min-w-0

                      truncate

                      text-[11px]
                      sm:text-xs

                      font-mono

                      text-[rgba(var(--hk-text-rgb),0.45)]
                    "
                  >
                    {currentUrl}
                  </span>

                  <button
                    type="button"
                    onClick={() => copyCurrentUrl(true)}
                    className={`
                      shrink-0

                      min-w-[72px]

                      flex
                      items-center
                      justify-center
                      gap-1.5

                      rounded-full

                      px-3
                      py-1.5

                      text-[10px]
                      sm:text-[11px]

                      font-semibold

                      transition-all
                      duration-200

                      active:scale-95

                      ${
                        copied
                          ? `
                            bg-[var(--hk-accent-solid)]
                            text-[var(--hk-accent-solid-text)]
                          `
                          : `
                            bg-[var(--hk-text)]
                            text-[var(--hk-bg)]
                            hover:bg-[var(--hk-accent-solid)]
                          `
                      }
                    `}
                  >
                    {copied && <Check size={12} />}

                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* ================= INFO ================= */}

                <p
                  className="
                    mt-3

                    text-center

                    text-[9px]
                    sm:text-[10px]

                    font-mono

                    tracking-[0.05em]

                    text-[rgba(var(--hk-text-rgb),0.2)]
                  "
                >
                  LINK COPIED AUTOMATICALLY WHEN SHARE OPENS
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <>
      {/* =====================================================
          SHARE SIDEBAR
      ===================================================== */}

      <aside
        className="
          w-14
          min-h-[calc(100vh-88px)]
          sticky
          top-[88px]
          shrink-0
          font-mono
        "
      >
        <div
          className="
            h-full
            py-6
            flex
            flex-col
            items-center
            gap-4

            bg-[rgba(var(--hk-bg-rgb),0.92)]
            backdrop-blur-xl

            border-l
            border-[rgba(var(--hk-card-border-rgb),0.14)]
            dark:border-[rgba(var(--hk-card-border-rgb),0.08)]
          "
        >
          {/* SHARE HEADING */}

          <div
            className="
              flex
              flex-col
              items-center
              gap-1
              select-none
            "
          >
            <Share2 size={15} className="text-[rgba(var(--hk-accent-rgb),0.55)]" />

            <span
              className="
                text-[0.45rem]
                tracking-[0.12em]
                uppercase
                text-[rgba(var(--hk-accent-rgb),0.35)]
              "
            >
              share
            </span>
          </div>

          <Divider />

          {/* =================================================
              SOCIAL BUTTONS
          ================================================= */}

          <div className="flex flex-col items-center gap-2">
            <IconBtn
              onClick={openShareModal}
              ariaLabel="Share on WhatsApp"
              hoverBg="hover:bg-[rgba(37,211,102,0.10)]"
              hoverShadow="hover:shadow-[0_0_10px_rgba(37,211,102,0.18)]"
            >
              <FaWhatsapp
                size={14}
                className="
                  text-[rgba(37,211,102,0.75)]
                  group-hover:text-[#25D366]
                "
              />
            </IconBtn>

            <IconBtn
              onClick={openShareModal}
              ariaLabel="Share on Instagram"
              hoverBg="hover:bg-[rgba(225,48,108,0.10)]"
              hoverShadow="hover:shadow-[0_0_10px_rgba(225,48,108,0.20)]"
            >
              <Instagram
                size={14}
                className="
                  text-[rgba(225,48,108,0.65)]
                  group-hover:text-[rgb(225,48,108)]
                "
              />
            </IconBtn>

            <IconBtn
              onClick={openShareModal}
              ariaLabel="Share on LinkedIn"
              hoverBg="hover:bg-[rgba(10,102,194,0.10)]"
              hoverShadow="hover:shadow-[0_0_10px_rgba(10,102,194,0.20)]"
            >
              <Linkedin
                size={14}
                className="
                  text-[rgba(10,102,194,0.75)]
                  group-hover:text-[#3b9cff]
                "
              />
            </IconBtn>
          </div>

          <Divider />

          {/* =================================================
              WISHLIST
          ================================================= */}

          <div className="flex flex-col items-center gap-1">
            <IconBtn
              onClick={handleToggleLike}
              disabled={isCheckingLike}
              active={liked}
              ariaLabel={liked ? "Remove from wishlist" : "Add to wishlist"}
              hoverBg="hover:bg-[rgba(255,60,60,0.10)]"
              hoverShadow="hover:shadow-[0_0_10px_rgba(255,60,60,0.18)]"
            >
              <Heart
                size={14}
                className={`
                  transition-all
                  duration-200

                  ${
                    liked
                      ? "text-[#ff6060] fill-[#ff6060] scale-110"
                      : "text-[rgba(255,96,96,0.5)] group-hover:text-[#ff6060]"
                  }
                `}
              />
            </IconBtn>

            {liked && (
              <span
                className="
                  text-[0.45rem]
                  tracking-[0.1em]
                  uppercase
                  text-[rgba(255,96,96,0.6)]
                "
              >
                liked
              </span>
            )}
          </div>
        </div>
      </aside>

      <ShareModal />
    </>
  );
};
