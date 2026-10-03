import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../pages/Styles/AllHackathons.css";

const Loader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    setOpacity(1);
    const t1 = setTimeout(() => setOpacity(0), 1000);
    const t2 = setTimeout(() => setIsLoading(false), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--hk-bg)] z-[9999] flex items-center justify-center"
      style={{ transition: "opacity 1s ease-in-out", opacity }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(var(--hk-accent-rgb),.028) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--hk-accent-rgb),.028) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full pointer-events-none animate-pulse"
        style={{ background: "radial-gradient(circle, rgba(var(--hk-accent-rgb),0.12) 0%, transparent 65%)" }}
      />

      <div className="relative z-10">
        <div className="relative w-48 h-48">
          <img
            src="/hackSprint.webp"
            className="w-full h-full object-contain animate-[float_3s_ease-in-out_infinite]"
            style={{ filter: "drop-shadow(0 0 10px rgba(var(--hk-accent-rgb),0.5))" }}
          />
          <div className="absolute inset-[-10px] border-2 border-[rgba(var(--hk-accent-rgb),0.2)] rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-[-20px] border-2 border-[rgba(var(--hk-accent-rgb),0.1)] rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        </div>

        <div className="absolute bottom-[-3rem] left-1/2 -translate-x-1/2 flex space-x-3">
          <div className="w-2 h-2 bg-[var(--hk-accent-solid)] rounded-full opacity-80 animate-[bounce_1.5s_infinite_0ms]" />
          <div className="w-2 h-2 bg-[var(--hk-accent-solid)] rounded-full opacity-80 animate-[bounce_1.5s_infinite_300ms]" />
          <div className="w-2 h-2 bg-[var(--hk-accent-solid)] rounded-full opacity-80 animate-[bounce_1.5s_infinite_600ms]" />
        </div>
      </div>
    </div>
  );
};

export default Loader;