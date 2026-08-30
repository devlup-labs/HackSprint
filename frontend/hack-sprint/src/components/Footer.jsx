import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HackSprint from "/hackSprint.webp";
import {
  Mail,
  MapPin,
  SendIcon,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
    .ft-root { font-family: 'JetBrains Mono', monospace; }
    .ft-syne { font-family: 'Syne', sans-serif; }

    /* top scanline */
    .ft-scanline::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(95,255,96,0.3), transparent);
      pointer-events: none;
    }

    /* corner brackets on community card */
    .ft-card::before, .ft-card::after {
      content: ''; position: absolute;
      width: 8px; height: 8px; border-style: solid;
      border-color: rgba(95,255,96,0.38);
    }
    .ft-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
    .ft-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }

    /* matrix canvas */
    .ft-canvas { opacity: 0.07; }

    /* social icon glow on hover */
    .ft-social:hover { filter: drop-shadow(0 0 6px rgba(95,255,96,0.5)); }

    /* input focus ring */
    .ft-input:focus {
      outline: none;
      border-color: rgba(95,255,96,0.45);
      box-shadow: 0 0 0 2px rgba(95,255,96,0.06);
    }
  `}</style>
);

const Footer = () => {
  const [email, setEmail] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const fontSize = 10;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns)
      .fill(null)
      .map(() => Math.random() * -100);
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#5fff60";
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        ctx.fillText(
          Math.random() > 0.5 ? "1" : "0",
          i * fontSize,
          drops[i] * fontSize
        );
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975)
          drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 50);
    window.addEventListener("resize", resize);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const GITHUB_REPO_URL = "https://github.com/devlup-labs/HackSprint";

  const navSections = [
    {
      title: "Resources",
      external: true,
      links: [
        { name: "Sessions", url: "https://www.youtube.com/@devluplabs1365" },
        { name: "Documentation", url: GITHUB_REPO_URL },
        { name: "Guides", url: GITHUB_REPO_URL },
        { name: "Explore Projects", url: "https://github.com/devlup-labs/" },
        { name: "Terms & Conditions", url: "/terms-and-condition" },
        { name: "Privacy Policy", url: "/privacy-policy" },
      ],
    },
    {
      title: "Quick Links",
      external: false,
      links: [
        { name: "Home", url: "/" },
        { name: "Hackathons", url: "/hackathons" },
        { name: "Participation Policies", url: "/participation-policies" },
        { name: "Organizer Playbook", url: "/organizer-ruleBook" },
        { name: "Architecture", url: "/architecture" },
      ],
    },
  ];

  const socialLinks = [
    {
      name: "GitHub",
      icon: <Github size={16} />,
      url: GITHUB_REPO_URL,
    },
    {
      name: "Instagram",
      icon: <Instagram size={16} />,
      url: "https://www.instagram.com/hack.sprint?igsh=MWN6bjlldTV2Z2Nqdg==",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={16} />,
      url: "https://www.linkedin.com/company/hacksprintiitj/",
    },
    {
      name: "Twitter",
      icon: <Twitter size={16} />,
      url: "https://x.com/devluplabs",
    },
    {
      name: "Facebook",
      icon: <Facebook size={16} />,
      url: "https://www.facebook.com/devluplabs/",
    },
  ];

  const canJoin = email.includes("@");

  return (
    <>
      <Styles />
      <footer className="ft-root ft-scanline relative bg-[#0a0a0a] text-[#e8ffe8] overflow-hidden border-t border-[rgba(95,255,96,0.08)]">
        <canvas
          ref={canvasRef}
          className="ft-canvas absolute inset-0 w-full h-full pointer-events-none"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10 pb-10 border-b border-[rgba(95,255,96,0.07)]">
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={HackSprint}
                  className="h-9 w-9 object-contain"
                  alt="HackSprint"
                />
                <span className="ft-syne font-extrabold text-[1.2rem] tracking-tight text-white">
                  Hack<span className="text-[#5fff60]">Sprint</span>
                </span>
              </div>

              <p className="text-[0.67rem] text-[rgba(180,220,180,0.45)] leading-relaxed mb-6 tracking-[0.02em]">
                From dev quests to hackathons — build skills that get noticed in
                placements and internships.
              </p>

              <div className="flex flex-col gap-2.5">
                <a
                  href="mailto:devluplabs@iitj.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[0.65rem] text-[rgba(180,220,180,0.45)] hover:text-[#5fff60] transition-colors group"
                >
                  <Mail size={12} className="text-[#5fff60] flex-shrink-0" />
                  devluplabs@iitj.ac.in
                </a>
                <a
                  href="https://www.google.com/maps/place/Indian+Institute+of+Technology+(IIT),+Jodhpur/@26.4710162,73.1085513"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2 text-[0.65rem] text-[rgba(180,220,180,0.45)] hover:text-[#5fff60] transition-colors"
                >
                  <MapPin
                    size={12}
                    className="text-[#5fff60] flex-shrink-0 mt-[1px]"
                  />
                  IIT Jodhpur, Rajasthan
                </a>
              </div>
            </div>

            {/* ── Nav cols ── */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-8 lg:ml-10">
              {navSections.map((section) => (
                <div key={section.title}>
                  <div className="font-jb text-[0.55rem] tracking-[0.18em] uppercase text-[rgba(95,255,96,0.5)] border-l-2 border-[rgba(95,255,96,0.3)] pl-2 mb-4">
                    {section.title}
                  </div>
                  <ul className="flex flex-col gap-2">
                    {section.links.map((item) => (
                      <li key={item.name}>
                        {section.external ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ft-root text-[0.65rem] text-[rgba(180,220,180,0.42)] hover:text-[#5fff60] transition-colors duration-150 tracking-[0.03em]"
                          >
                            {item.name}
                          </a>
                        ) : (
                          <Link
                            to={item.url}
                            className="ft-root text-[0.65rem] text-[rgba(180,220,180,0.42)] hover:text-[#5fff60] transition-colors duration-150 tracking-[0.03em]"
                          >
                            {item.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* ── Community col ── */}
            <div className="lg:col-span-4">
              <div className="ft-card relative bg-[rgba(10,12,10,0.7)] border border-[rgba(95,255,96,0.1)] rounded-[4px] p-5 mb-6">
                <div className="ft-root text-[0.55rem] tracking-[0.18em] uppercase text-[rgba(95,255,96,0.5)] mb-4">
                  Join our community
                </div>

                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex flex-col gap-2"
                >
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="participant@email.com"
                      className="ft-input ft-root w-full bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.12)] rounded-[3px] py-2 pl-3 pr-10 text-[0.68rem] text-[#e8ffe8] placeholder-[rgba(95,255,96,0.2)] transition-all"
                      required
                    />
                    <a
                      href={
                        canJoin ? "https://discord.com/invite/5kKqzGdhPP" : "#"
                      }
                      target={canJoin ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!canJoin) e.preventDefault();
                      }}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-[2px] flex items-center justify-center transition-all
                        ${
                          canJoin
                            ? "bg-[rgba(95,255,96,0.12)] text-[#5fff60] hover:bg-[rgba(95,255,96,0.2)] cursor-pointer"
                            : "bg-[rgba(95,255,96,0.04)] text-[rgba(95,255,96,0.2)] cursor-not-allowed"
                        }`}
                    >
                      <SendIcon size={13} />
                    </a>
                  </div>
                  <p className="ft-root text-[0.58rem] text-[rgba(180,220,180,0.3)] tracking-[0.03em]">
                    Stay updated with our latest tutorials and resources.
                  </p>
                </form>
              </div>

              {/* Social links */}
              <div>
                <div className="ft-root text-[0.55rem] tracking-[0.18em] uppercase text-[rgba(95,255,96,0.5)] mb-3">
                  Connect with us
                </div>
                <div className="flex gap-3">
                  {socialLinks.map(({ name, icon, url }) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={name}
                      className="ft-social w-8 h-8 flex items-center justify-center rounded-[3px] border border-[rgba(95,255,96,0.12)] bg-[rgba(95,255,96,0.04)] text-[rgba(95,255,96,0.4)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.35)] hover:bg-[rgba(95,255,96,0.08)] transition-all duration-150"
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img
                src={HackSprint}
                alt=""
                className="w-7 h-7 object-contain opacity-40"
              />
              <span className="ft-syne font-extrabold text-[0.8rem] tracking-tight text-[rgba(255,255,255,0.5)]">
                Hack<span className="text-[rgba(95,255,96,0.5)]">Sprint</span>
              </span>
            </div>
            <span className="ft-root text-[0.55rem] tracking-[0.1em] uppercase text-[rgba(120,160,120,0.5)]">
              © {new Date().getFullYear()} HackSprint · DevLup Labs · IIT
              Jodhpur
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
