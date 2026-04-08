import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { getDashboard } from "../backendApis/api";
import {
  Users,
  Crown,
  Mail,
  Check,
  X,
  Copy,
  User,
  Clock,
  LinkIcon,
} from "lucide-react";
import { API } from "../backendApis/api";

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const IconBtn = ({ onClick, disabled, color = "green", children }) => {
  const c = {
    green:
      "border-[rgba(95,255,96,0.2)] bg-[rgba(95,255,96,0.07)] text-[rgba(95,255,96,0.65)] hover:bg-[rgba(95,255,96,0.14)] hover:text-[#5fff60]",
    red: "border-[rgba(255,60,60,0.2)] bg-[rgba(255,60,60,0.07)] text-[rgba(255,100,100,0.65)] hover:bg-[rgba(255,60,60,0.14)] hover:text-[#ff9090]",
  }[color];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${mono} w-8 h-8 flex items-center justify-center rounded-[3px] border cursor-pointer transition-all disabled:opacity-35 disabled:cursor-not-allowed ${c}`}
    >
      {children}
    </button>
  );
};

const CopyRow = ({ label, value, copyKey, copiedItem, onCopy }) => (
  <div>
    <div
      className={`${mono} text-[0.52rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.45)] mb-1.5`}
    >
      {label}
    </div>
    <div className="flex items-center gap-2 px-3 py-2.5 bg-[rgba(95,255,96,0.04)] border border-[rgba(95,255,96,0.15)] rounded-[3px]">
      <span
        className={`${mono} flex-1 text-[#5fff60] text-[0.68rem] truncate`}
        title={value}
      >
        {value}
      </span>
      <IconBtn onClick={() => onCopy(value, copyKey)}>
        {copiedItem === copyKey ? <Check size={12} /> : <Copy size={12} />}
      </IconBtn>
    </div>
  </div>
);

const MemberCard = ({ member, isLeader }) => (
  <div className="relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] p-4 hover:border-[rgba(95,255,96,0.25)] transition-all">
    <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.35)]" />
    <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(95,255,96,0.35)]" />
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center border flex-shrink-0 ${
          isLeader
            ? "bg-[rgba(255,184,77,0.1)] border-[rgba(255,184,77,0.3)]"
            : "bg-[rgba(95,255,96,0.07)] border-[rgba(95,255,96,0.2)]"
        }`}
      >
        {isLeader ? (
          <Crown size={14} className="text-[#ffb84d]" />
        ) : (
          <User size={14} className="text-[rgba(95,255,96,0.6)]" />
        )}
      </div>
      <div>
        <h3
          className={`${syne} font-extrabold text-white text-sm tracking-tight`}
        >
          {member.name}
        </h3>
        <p
          className={`${mono} text-[0.55rem] tracking-[0.08em] ${
            isLeader
              ? "text-[rgba(255,184,77,0.6)]"
              : "text-[rgba(180,220,180,0.4)]"
          }`}
        >
          {isLeader ? "Team Leader" : "Member"}
        </p>
      </div>
    </div>
    <div
      className={`${mono} flex items-center gap-1.5 text-[0.62rem] text-[rgba(180,220,180,0.55)]`}
    >
      <Mail size={11} className="text-[rgba(95,255,96,0.45)] flex-shrink-0" />
      <span className="truncate">{member.email}</span>
    </div>
  </div>
);

const PendingCard = ({ request, onAction, actionLoading, formatDate }) => (
  <div className="relative bg-[rgba(10,12,10,0.88)] border border-[rgba(255,184,77,0.15)] rounded-[4px] p-4 hover:border-[rgba(255,184,77,0.28)] transition-all">
    <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(255,184,77,0.4)]" />
    <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(255,184,77,0.4)]" />
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center border bg-[rgba(255,184,77,0.08)] border-[rgba(255,184,77,0.25)] flex-shrink-0">
          <Clock size={13} className="text-[#ffb84d]" />
        </div>
        <div className="min-w-0">
          <h3
            className={`${syne} font-extrabold text-white text-sm tracking-tight truncate`}
          >
            {request.name}
          </h3>
          <p className={`${mono} text-[0.55rem] text-[rgba(180,220,180,0.4)]`}>
            Requested {formatDate(request.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <IconBtn
          color="green"
          onClick={() => onAction(request._id, "accept")}
          disabled={actionLoading}
        >
          <Check size={12} />
        </IconBtn>
        <IconBtn
          color="red"
          onClick={() => onAction(request._id, "reject")}
          disabled={actionLoading}
        >
          <X size={12} />
        </IconBtn>
      </div>
    </div>
    <div
      className={`${mono} flex items-center gap-1.5 text-[0.62rem] text-[rgba(180,220,180,0.55)]`}
    >
      <Mail size={11} className="text-[rgba(95,255,96,0.45)] flex-shrink-0" />
      <span className="truncate">{request.email}</span>
    </div>
  </div>
);

const TeamDetails = () => {
  const { hackathonId, teamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLeader, setIsLeader] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedItem, setCopiedItem] = useState(null);

  const getCode = useCallback(
    () => teamId || localStorage.getItem("teamDetails_code"),
    [teamId]
  );

  const fetchTeam = useCallback(
    async (user) => {
      if (!user) return;
      const code = getCode();
      try {
        if (code) {
          const [teamRes, pendingRes] = await Promise.all([
            API.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/team/search/${code}`
            ),
            API.post(
              `${import.meta.env.VITE_API_BASE_URL}/api/team/pendingRequests`,
              { teamCode: code }
            ),
          ]);
          setTeamData({
            ...teamRes.data.team,
            pendingMembers: pendingRes.data,
          });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error fetching team data.");
      } finally {
        setLoading(false);
      }
    },
    [getCode]
  );

  useEffect(() => {
    if (location.state?.secretCode)
      localStorage.setItem("teamDetails_code", location.state.secretCode);
    getDashboard()
      .then((res) => {
        const u = res.data.userData;
        setCurrentUser(u);
        fetchTeam(u);
      })
      .catch(() => {
        toast.error("You must be logged in.");
        navigate("/login");
      });
  }, [hackathonId, teamId, navigate, fetchTeam, location.state]);

  useEffect(() => {
    if (currentUser && teamData)
      setIsLeader(currentUser._id === teamData.leader._id);
  }, [currentUser, teamData]);

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    });
  };

  const handleRequestAction = async (userId, action) => {
    setActionLoading(true);
    try {
      const r = await API.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/team/handleRequest`,
        { teamCode: teamData.code, userId, action }
      );
      toast.success(r.data.message);
      fetchTeam(currentUser);
    } catch (err) {
      toast.error(err.response?.data?.message || `Error ${action}ing request.`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

  if (loading || !teamData)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-3">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
        <div className="w-8 h-8 rounded-full border-2 border-[rgba(95,255,96,0.15)] border-t-[#5fff60] animate-spin" />
        <p
          className={`${mono} text-[0.62rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.4)]`}
        >
          Loading team details…
        </p>
      </div>
    );

  const allMembers = [teamData.leader, ...teamData.members];
  const spotsLeft = teamData.maxTeamSize - allMembers.length;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
      <div
        className={`${mono} min-h-screen bg-[#0a0a0a] text-[#e8ffe8] relative overflow-x-hidden`}
      >
        {/* grid bg */}
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
          style={{
            background:
              "radial-gradient(ellipse,rgba(95,255,96,.06) 0%,transparent 65%)",
          }}
        />

        <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8">
            <div
              className={`${mono} text-[0.52rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.4)] mb-2`}
            >
              Team Dashboard
            </div>
            <h1
              className={`${syne} font-extrabold text-white text-3xl sm:text-4xl tracking-tight mb-1.5`}
            >
              {teamData.name}
            </h1>
            <p
              className={`${mono} text-[0.65rem] text-[rgba(180,220,180,0.5)] tracking-[0.04em]`}
            >
              Created {formatDate(teamData.createdAt)} · {allMembers.length}/
              {teamData.maxTeamSize} members
            </p>
          </div>

          {isLeader && (
            <>
              {spotsLeft > 0 && (
                <div className="relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.12)] rounded-[4px] p-6 mb-7">
                  <span className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5 border-t-2 border-l-2 border-[rgba(95,255,96,0.45)]" />
                  <span className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[rgba(95,255,96,0.45)]" />
                  <div className="flex items-center gap-2 mb-5">
                    <LinkIcon
                      size={14}
                      className="text-[rgba(95,255,96,0.55)]"
                    />
                    <h2
                      className={`${syne} font-extrabold text-white text-base tracking-tight`}
                    >
                      Invite Team Members
                    </h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <CopyRow
                      label="Invite Code"
                      value={teamData.code}
                      copyKey="code"
                      copiedItem={copiedItem}
                      onCopy={handleCopy}
                    />
                    {/* <CopyRow
                      label="Invite Link"
                      value={teamData.secretLink}
                      copyKey="link"
                      copiedItem={copiedItem}
                      onCopy={handleCopy}
                    /> */}
                  </div>
                </div>
              )}

              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={15} className="text-[#ffb84d]" />
                  <h2
                    className={`${syne} font-extrabold text-white text-lg tracking-tight`}
                  >
                    Join Requests
                  </h2>
                  <span
                    className={`${mono} text-[0.55rem] tracking-[0.1em] uppercase px-2 py-[3px] rounded-[2px] border bg-[rgba(255,184,77,0.08)] border-[rgba(255,184,77,0.25)] text-[#ffb84d]`}
                  >
                    {teamData.pendingMembers.length}
                  </span>
                </div>
                {teamData.pendingMembers.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamData.pendingMembers.map((r) => (
                      <PendingCard
                        key={r._id}
                        request={r}
                        onAction={handleRequestAction}
                        actionLoading={actionLoading}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="relative bg-[rgba(10,12,10,0.6)] border border-[rgba(95,255,96,0.08)] rounded-[4px] p-6 text-center">
                    <p
                      className={`${mono} text-[0.65rem] text-[rgba(180,220,180,0.35)] tracking-[0.04em]`}
                    >
                      No pending requests.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <div className="flex items-center gap-2 mb-5">
              <Users size={15} className="text-[rgba(95,255,96,0.6)]" />
              <h2
                className={`${syne} font-extrabold text-white text-lg tracking-tight`}
              >
                Team Members
              </h2>
              <span
                className={`${mono} text-[0.55rem] tracking-[0.1em] uppercase px-2 py-[3px] rounded-[2px] border bg-[rgba(95,255,96,0.07)] border-[rgba(95,255,96,0.2)] text-[rgba(95,255,96,0.65)]`}
              >
                {allMembers.length}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MemberCard member={teamData.leader} isLeader />
              {teamData.members.map((m) => (
                <MemberCard key={m._id} member={m} isLeader={false} />
              ))}
              {spotsLeft > 0 && (
                <div className="border border-dashed border-[rgba(95,255,96,0.15)] rounded-[4px] p-6 flex flex-col items-center justify-center gap-1">
                  <span
                    className={`${mono} text-[0.65rem] text-[rgba(180,220,180,0.3)] tracking-[0.04em]`}
                  >
                    {spotsLeft} spot{spotsLeft > 1 ? "s" : ""} remaining
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamDetails;
