import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ProfileAPI } from "../../api/profile.api.js";
import { MapPin, Link2, Award, Code2, Languages, ArrowLeft, User } from "lucide-react";

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const Section = ({ icon: Icon, title, children }) => (
  <div className="relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] p-5">
    <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.35)]" />
    <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(95,255,96,0.35)]" />
    <div className={`${mono} flex items-center gap-2 text-[0.62rem] tracking-[0.12em] uppercase text-[rgba(95,255,96,0.5)] mb-3`}>
      <Icon size={12} />
      {title}
    </div>
    {children}
  </div>
);

const Chip = ({ children }) => (
  <span className={`${mono} inline-block text-[0.66rem] px-2.5 py-1 rounded-full bg-[rgba(95,255,96,0.06)] border border-[rgba(95,255,96,0.18)] text-[rgba(180,220,180,0.8)]`}>
    {children}
  </span>
);

const PublicProfile = () => {
  const { userName } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const res = await ProfileAPI.getPublicProfile(userName, { signal: controller.signal });
        setProfile(res.data.profile);
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;
        setNotFound(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [userName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-3">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
        <div className="w-8 h-8 rounded-full border-2 border-[rgba(95,255,96,0.15)] border-t-[#5fff60] animate-spin" />
        <p className={`${mono} text-[0.62rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.4)]`}>
          Loading profile…
        </p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
        <User size={32} className="text-[rgba(95,255,96,0.25)]" />
        <p className={`${syne} font-extrabold text-white text-lg`}>User not found</p>
        <Link to="/" className={`${mono} text-[0.65rem] tracking-[0.08em] uppercase text-[rgba(95,255,96,0.6)] hover:text-[#5fff60]`}>
          <ArrowLeft size={12} className="inline mr-1" /> Back to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
      <div className={`${mono} min-h-screen bg-[#0a0a0a] text-[#e8ffe8] relative overflow-x-hidden`}>
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(95,255,96,.026) 1px,transparent 1px),linear-gradient(90deg,rgba(95,255,96,.026) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none z-0 rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(95,255,96,.06) 0%,transparent 65%)" }}
        />

        <div className="relative z-10 max-w-[700px] mx-auto px-4 sm:px-6 py-10 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <img
              src={profile.image || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"}
              alt={profile.name}
              className="w-20 h-20 rounded-full border-2 border-[rgba(95,255,96,0.3)] object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className={`${syne} font-extrabold text-white text-2xl tracking-tight truncate`}>
                {profile.name}
              </h1>
              {profile.userName && (
                <p className={`${mono} text-[0.68rem] text-[rgba(95,255,96,0.55)]`}>@{profile.userName}</p>
              )}
              {profile.location && (
                <p className={`${mono} flex items-center gap-1 text-[0.62rem] text-[rgba(180,220,180,0.5)] mt-1`}>
                  <MapPin size={11} /> {profile.location}
                </p>
              )}
            </div>
          </div>

          {profile.bio && (
            <Section icon={User} title="About">
              <p className="text-[0.75rem] text-[rgba(220,240,220,0.8)] leading-relaxed">{profile.bio}</p>
            </Section>
          )}

          {profile.skills?.length > 0 && (
            <Section icon={Code2} title="Skills">
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s, i) => <Chip key={i}>{s}</Chip>)}
              </div>
            </Section>
          )}

          {profile.languages?.length > 0 && (
            <Section icon={Languages} title="Languages">
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((l, i) => <Chip key={i}>{l}</Chip>)}
              </div>
            </Section>
          )}

          {profile.connectedApps?.length > 0 && (
            <Section icon={Link2} title="Links">
              <div className="flex flex-col gap-2">
                {profile.connectedApps.map((app, i) => (
                  <a
                    key={i}
                    href={app.appURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.7rem] text-[rgba(95,255,96,0.7)] hover:text-[#5fff60] truncate"
                  >
                    {app.appName}
                  </a>
                ))}
              </div>
            </Section>
          )}

          {profile.badges?.length > 0 && (
            <Section icon={Award} title="Badges">
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((b, i) => <Chip key={i}>{b}</Chip>)}
              </div>
            </Section>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicProfile;
