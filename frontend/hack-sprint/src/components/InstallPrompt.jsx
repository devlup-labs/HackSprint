import React, { useEffect, useState } from "react";
import "../pages/Styles/AllHackathons.css";
import { Download, Share, X } from "lucide-react";

const DISMISSED_KEY = "installPromptDismissed";

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

// Floating install button, bottom-right, site-wide. Chromium browsers fire
// `beforeinstallprompt` when the site qualifies as installable — we capture
// that event (browsers hide their own default UI once you call
// preventDefault()) and trigger it ourselves from this button instead. iOS
// Safari never fires that event at all (Apple doesn't support it), so there
// we show the same button but it opens a short "how to" tip instead of a
// native prompt, since there's no programmatic install trigger there.
const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosTip, setShowIosTip] = useState(false);
  const [visible, setVisible] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // The chat widget floats in the same corner — hide this while it's open
  // instead of stacking on top of it.
  useEffect(() => {
    const handleChatbotToggle = (e) => setChatbotOpen(!!e.detail?.open);
    window.addEventListener("hacksprint:chatbot-toggle", handleChatbotToggle);
    return () =>
      window.removeEventListener("hacksprint:chatbot-toggle", handleChatbotToggle);
  }, []);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISSED_KEY)) return;

    if (isIos()) {
      setVisible(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
    setShowIosTip(false);
  };

  const handleClick = async () => {
    if (isIos()) {
      setShowIosTip((v) => !v);
      return;
    }
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    // A captured beforeinstallprompt event can only be used once either way.
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible || chatbotOpen) return null;

  return (
    <div className="fixed bottom-24 right-5 z-[9999] font-[family-name:'JetBrains_Mono',monospace]">
      {showIosTip && (
        <div className="absolute bottom-full right-0 mb-2 w-56 bg-[rgba(var(--hk-bg-rgb),0.98)] border border-[rgba(var(--hk-card-border-rgb),0.32)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)] rounded-[4px] p-3 text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.8)] leading-relaxed shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          Tap <Share size={11} className="inline text-[var(--hk-accent-solid)] mx-0.5 -mt-0.5" /> in Safari's
          toolbar, then "Add to Home Screen".
        </div>
      )}
      <div className="flex items-center gap-1 bg-[rgba(var(--hk-bg-rgb),0.98)] border border-[rgba(var(--hk-card-border-rgb),0.4)] dark:border-[rgba(var(--hk-card-border-rgb),0.25)] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] pl-4 pr-1.5 py-1.5">
        <button
          onClick={handleClick}
          className="flex items-center gap-2 text-[0.65rem] tracking-[0.05em] uppercase text-[var(--hk-accent-solid)] hover:text-[#7fff80] transition-colors cursor-pointer"
        >
          <Download size={14} /> Install App
        </button>
        <button
          onClick={dismiss}
          title="Dismiss"
          className="w-6 h-6 rounded-full flex items-center justify-center text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)] hover:text-[var(--hk-text)] hover:bg-[rgba(var(--hk-accent-rgb),0.1)] transition-colors cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
