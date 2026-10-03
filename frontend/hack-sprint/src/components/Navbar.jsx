import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ProfileAPI } from "../api/profile.api.js";
import { useAuth } from "../hooks/useAuth.js";
import NotificationBell from "./NotificationBell.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import {
  Menu, X, User, Trophy, LogOut, Users,
  LogIn, Shield, Mail,
} from "lucide-react";
import "./Navbar.css";

const Navbar = ({ variant = "student" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: adminUser, role, loading: authLoading, logoutAndClear } = useAuth();
  // The icon follows whoever is signed in, on every page of the platform —
  // not just inside the admin layout.
  const isAdminVariant = role === "admin" || variant === "admin";
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const navItems = [
    { name: "Events", pageLink: "/hackathons", icon: Trophy },
    { name: "Community", pageLink: "/people", icon: Users },
    { name: "Contact Us", pageLink: "/contact", icon: Mail },
  ];

  const handleNavigate = (link) => { navigate(link); setIsOpen(false); setShowProfileMenu(false); };
  const handleLogout = async () => {
    await logoutAndClear(false);
    localStorage.removeItem("email");
    setUserInfo(null); setIsLoggedIn(false);
    navigate("/"); setIsOpen(false); setShowProfileMenu(false);
  };
  const handleAdminLogout = async () => {
    await logoutAndClear(true);
    navigate("/adminhome"); setIsOpen(false); setShowProfileMenu(false);
  };

  const fetchProfile = async () => {
    try {
      const res = await ProfileAPI.getMyProfile();
      setUserInfo(res.data.profile);
      setIsLoggedIn(true);
    } catch {
      handleLogout();
    }
  };

  const isActive = (path) => location.pathname === path;

  const avatarUrl = isAdminVariant ? adminUser?.avatar : userInfo?.image?.url;

  useEffect(() => {
    if (authLoading) return;
    if (isAdminVariant) { setIsLoggedIn(false); setUserInfo(null); return; }
    const token = localStorage.getItem("token");
    if (!token) { setIsLoggedIn(false); return; }
    fetchProfile();
  }, [location, isAdminVariant, authLoading]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    if (showProfileMenu) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  return (
    <>
      <nav className={`nb-root nb-nav fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/95 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-card/80 backdrop-blur-sm border-b border-border/60"
      }`}>

        <div className="max-w-[1200px] mx-auto px-5">
          <div className="flex items-center justify-between h-14">

            {/* ── Logo ── */}
            <button onClick={() => handleNavigate("/")} className="flex items-center gap-[0.55rem] bg-transparent border-none cursor-pointer">
              <img src="/hackSprint.webp" className="w-8 h-8 object-contain" alt="HackSprint" />
              <span className="nb-syne font-bold text-[1.1rem] tracking-normal text-foreground">
                Hack<span className="text-primary">Sprint</span>
              </span>
            </button>

            {/* ── Desktop nav ── */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ name, pageLink, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => handleNavigate(pageLink)}
                  className={`relative nb-root inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full cursor-pointer transition-all duration-150
                    ${isActive(pageLink)
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                >
                  <Icon size={15} /> {name}
                </button>
              ))}


              <div className="flex items-center gap-1 ml-3 pl-3 border-l border-border">
                <ThemeToggle />
                {isAdminVariant && <NotificationBell asAdmin />}
                {!isAdminVariant && isLoggedIn && <NotificationBell />}
              </div>

              <div className="relative ml-1" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-8 h-8 rounded-full bg-accent border-2 border-border flex items-center justify-center overflow-hidden hover:border-primary/50 transition-all duration-200 cursor-pointer"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : isAdminVariant ? (
                    <Shield size={14} className="text-primary" />
                  ) : isLoggedIn && userInfo?.name ? (
                    <span className="nb-syne font-extrabold text-primary text-[0.7rem]">{userInfo.name[0].toUpperCase()}</span>
                  ) : (
                    <User size={14} className="text-primary" />
                  )}
                </button>

                {showProfileMenu && (
                  <div className="nb-dropdown absolute right-0 mt-2 w-60 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                    {isAdminVariant ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/60">
                          <div className="w-9 h-9 rounded-full bg-accent border-2 border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Shield size={16} className="text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="nb-root text-sm font-semibold text-popover-foreground truncate">{adminUser?.adminName || "Admin"}</p>
                            <p className="nb-root text-xs text-muted-foreground truncate">{adminUser?.email || ""}</p>
                          </div>
                        </div>

                        <div className="p-3">
                          <button
                            onClick={() => handleNavigate("/admin")}
                            className="nb-root w-full flex items-center justify-center gap-1.5 p-2.5 bg-secondary rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
                          >
                            <Shield size={15} className="text-primary" />
                            <span>Admin dashboard</span>
                          </button>
                        </div>

                        <div className="px-3 pb-3 border-t border-border pt-2">
                          <button
                            onClick={handleAdminLogout}
                            className="nb-root w-full flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                          >
                            <LogOut size={15} /> Logout
                          </button>
                        </div>
                      </>
                    ) : isLoggedIn ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/60">
                          <div className="w-9 h-9 rounded-full bg-accent border-2 border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="nb-syne font-extrabold text-primary text-sm">
                                {userInfo?.name ? userInfo.name[0].toUpperCase() : "U"}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="nb-root text-sm font-semibold text-popover-foreground truncate">{userInfo?.name || "Guest"}</p>
                            <p className="nb-root text-xs text-muted-foreground truncate">{userInfo?.email || ""}</p>
                          </div>
                        </div>

                        <div className="p-3">
                          <button
                            onClick={() => handleNavigate("/dashboard")}
                            className="nb-root w-full flex items-center justify-center gap-1.5 p-2.5 bg-secondary rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
                          >
                            <User size={15} className="text-primary" />
                            <span>My Dashboard</span>
                          </button>
                        </div>

                        <div className="px-3 pb-3 border-t border-border pt-2">
                          <button
                            onClick={handleLogout}
                            className="nb-root w-full flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                          >
                            <LogOut size={15} /> Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3">
                        <button
                          onClick={() => handleNavigate("/account/login")}
                          className="nb-root w-full flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer transition-all bg-primary text-primary-foreground hover:opacity-90"
                        >
                          <LogIn size={15} /> Login
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                className="flex items-center justify-center p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="nb-mobile md:hidden bg-popover border-t border-border">
            <div className="max-w-[1200px] mx-auto px-5 py-4 flex flex-col gap-1">

              {navItems.map(({ name, pageLink, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => handleNavigate(pageLink)}
                  className={`nb-root w-full inline-flex items-center justify-between text-sm font-medium px-4 py-3 rounded-lg cursor-pointer transition-all
                    ${isActive(pageLink)
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                >
                  <span className="flex items-center gap-2"><Icon size={15} /> {name}</span>
                </button>
              ))}


              <div className="h-px bg-border my-2" />

              {isAdminVariant ? (
                <>
                  <div className="nb-root flex items-center gap-3 px-4 py-3 bg-secondary/60 border border-border rounded-lg">
                    <div className="w-9 h-9 rounded-full bg-accent border-2 border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Shield size={16} className="text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="nb-root text-sm font-semibold text-foreground truncate">{adminUser?.adminName || "Admin"}</p>
                      <p className="nb-root text-xs text-muted-foreground truncate">{adminUser?.email || ""}</p>
                    </div>
                    <NotificationBell asAdmin />
                  </div>

                  <button
                    onClick={() => handleNavigate("/admin")}
                    className="nb-root w-full inline-flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                  >
                    <Shield size={15} className="text-primary" /> Admin dashboard
                  </button>

                  <button
                    onClick={handleAdminLogout}
                    className="nb-root w-full inline-flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : isLoggedIn ? (
                <>
                  <div className="nb-root flex items-center gap-3 px-4 py-3 bg-secondary/60 border border-border rounded-lg">
                    <div className="w-9 h-9 rounded-full bg-accent border-2 border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="nb-syne font-extrabold text-primary text-sm">
                          {userInfo?.name ? userInfo.name[0].toUpperCase() : "U"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="nb-root text-sm font-semibold text-foreground truncate">{userInfo?.name || "Guest"}</p>
                      <p className="nb-root text-xs text-muted-foreground truncate">{userInfo?.email || ""}</p>
                    </div>
                    <NotificationBell />
                  </div>

                  <button
                    onClick={() => handleNavigate("/dashboard")}
                    className="nb-root w-full inline-flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                  >
                    <User size={15} className="text-primary" /> Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="nb-root w-full inline-flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavigate("/account/login")}
                  className="nb-root w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-lg cursor-pointer bg-primary text-primary-foreground hover:opacity-90 transition-all"
                >
                  <LogIn size={15} /> Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="h-14" />
    </>
  );
};

export default Navbar;