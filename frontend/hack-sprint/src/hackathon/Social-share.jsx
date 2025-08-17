import { Share2, Twitter, Facebook, Linkedin, Link2, Heart } from "lucide-react";
import { Button } from "./Button";
import { useState } from "react";

export const SocialShare = () => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = "Check out this amazing hackathon!";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentUrl
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      currentUrl
    )}`,
  };

  return (
    <aside className="w-20 bg-surface/30 backdrop-blur-sm border-l border-green-500 min-h-screen sticky top-16">
      <div className="p-4 flex flex-col items-center space-y-6 pt-8">
        {/* Share header */}
        <div className="text-center">
          <Share2 className="w-6 h-6 text-hero-primary mx-auto mb-2" />
          <span className="text-xs text-text-secondary font-medium">Share</span>
        </div>

        {/* Social share buttons */}
        <div className="flex flex-col space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-green-500 group"
            onClick={() => window.open(shareUrls.twitter, "_blank")}
          >
            <Twitter className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 rounded-full bg-blue-600/10 hover:bg-blue-600/20 border border-green-500 group"
            onClick={() => window.open(shareUrls.facebook, "_blank")}
          >
            <Facebook className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
          </Button>

          {/* LinkedIn */}
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 rounded-full bg-blue-700/10 hover:bg-blue-700/20 border border-green-500 group"
            onClick={() => window.open(shareUrls.linkedin, "_blank")}
          >
            <Linkedin className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
          </Button>

          {/* Copy link */}
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 rounded-full bg-hero-primary/10 hover:bg-hero-primary/20 border border-green-500 group"
            onClick={handleCopyLink}
          >
            <Link2
              className={`w-5 h-5 text-hero-primary group-hover:scale-110 transition-all duration-200 ${
                copied ? "rotate-12" : ""
              }`}
            />
          </Button>
        </div>

        {/* Copy feedback */}
        {copied && (
          <div className="text-xs text-hero-primary font-medium animate-fade-in">
            Copied!
          </div>
        )}

        {/* Divider */}
        <div className="w-8 h-px bg-green-500" />

        {/* Like */}
        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 p-0 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-green-500 group"
          onClick={() => setLiked(!liked)}
        >
          <Heart
            className={`w-5 h-5 group-hover:scale-110 transition-all duration-200 ${
              liked ? "text-red-500 fill-red-500" : "text-red-400"
            }`}
          />
        </Button>

        {/* Scroll indicator */}
        <div className="mt-auto mb-4">
          <div className="w-1 h-16 bg-green-500 rounded-full relative overflow-hidden">
            <div className="w-full h-4 bg-hero-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};