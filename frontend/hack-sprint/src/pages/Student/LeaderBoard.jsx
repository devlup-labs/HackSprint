import React, { useState, useEffect } from "react";
import { Trophy, Crown, User } from "lucide-react";
import axios from "axios";
import "../Styles/LeaderBoard.css"
import { API } from "../../backendApis/api";

const PLACE_META = {
  1: {
    label: "#1",
    badgeBg: "rgba(255,196,0,0.15)",
    badgeBorder: "rgba(255,196,0,0.4)",
    badgeColor: "#ffd700",
    crown: true,
  },
  2: {
    label: "#2",
    badgeBg: "rgba(192,192,192,0.1)",
    badgeBorder: "rgba(192,192,192,0.3)",
    badgeColor: "#c0c0c0",
    crown: false,
  },
  3: {
    label: "#3",
    badgeBg: "rgba(205,127,50,0.1)",
    badgeBorder: "rgba(205,127,50,0.3)",
    badgeColor: "#cd7f32",
    crown: false,
  },
};

const PodiumCard = ({ user, place }) => {
  const m = PLACE_META[place];
  return (
    <div
      className={`lb-pod-card lb-pod-${place} p-5`}
      style={{ animationDelay: `${place * 0.1}s` }}
    >
      {/* crown */}
      {m.crown && (
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#ffd700,#ffb300)",
              borderRadius: "50%",
              padding: "0.35rem",
              boxShadow: "0 0 14px rgba(255,196,0,.4)",
              display: "flex",
            }}
          >
            <Crown size={16} style={{ color: "#050905" }} />
          </div>
        </div>
      )}

      <div style={{ marginTop: m.crown ? "0.75rem" : 0 }}>
        {/* place badge */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            margin: "0 auto 0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: m.badgeBg,
            border: `2px solid ${m.badgeBorder}`,
            boxShadow: `0 0 16px ${m.badgeBorder}`,
          }}
        >
          <span
            className="lb-syne"
            style={{ fontSize: "1rem", fontWeight: 800, color: m.badgeColor }}
          >
            {place}
          </span>
        </div>

        <h3
          className="lb-syne"
          style={{
            fontWeight: 800,
            fontSize: "0.9rem",
            color: "#fff",
            marginBottom: "0.2rem",
            letterSpacing: "-0.01em",
          }}
        >
          {user.name}
        </h3>
        <p
          className="lb-root"
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: m.badgeColor,
            letterSpacing: "0.02em",
          }}
        >
          {user.points}{" "}
          <span
            style={{
              fontSize: "0.6rem",
              color: "rgba(180,220,180,.45)",
              verticalAlign: "middle",
            }}
          >
            pts
          </span>
        </p>
      </div>
    </div>
  );
};

/* ── Main ── */
const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    API
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/user/leaderBoard`)
      .then((res) => {
        const data = [...(res.data.leaderboard || [])].sort(
          (a, b) => b.points - a.points
        );
        setLeaderboard(data);
        setHasData(data.length > 0);
      })
      .catch((err) => {
        // console.error(err);
        setHasData(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="lb-root lb-bg min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-3">
        <div className="lb-spinner" />
        <span
          style={{
            fontSize: "0.68rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(95,255,96,.35)",
          }}
        >
          Loading leaderboard…
        </span>
      </div>
    );

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  if (!hasData)
    return (
      <div className="lb-root lb-bg min-h-screen bg-[#0a0a0a] text-[#e8ffe8] flex flex-col items-center justify-center px-5 py-16">
        <div className="lb-a1 text-center mb-12">
          <h1
            className="lb-syne lb-a2"
            style={{
              fontSize: "clamp(2rem,4vw,4rem)",
              fontWeight: 800,
              color: "#5fff60",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Leaderboard.
          </h1>
          <p
            className="lb-root lb-a3"
            style={{
              fontSize: "0.72rem",
              color: "rgba(180,220,180,.45)",
              marginTop: "0.5rem",
              letterSpacing: "0.04em",
            }}
          >
            Compete with the best minds and claim your throne
          </p>
        </div>
        <div
          className="lb-table-card"
          style={{
            maxWidth: 480,
            width: "100%",
            padding: "3rem 2rem",
            textAlign: "center",
          }}
        >
          <Trophy
            size={40}
            style={{ color: "rgba(95,255,96,.2)", margin: "0 auto 1rem" }}
          />
          <h2
            className="lb-syne"
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            No Competitors Yet
          </h2>
          <p
            className="lb-root"
            style={{
              fontSize: "0.68rem",
              color: "rgba(180,220,180,.4)",
              lineHeight: 1.7,
            }}
          >
            Be the first to join the competition and claim your spot!
          </p>
        </div>
      </div>
    );

  return (
    <div className="lb-root lb-bg min-h-screen bg-[#0a0a0a] text-[#e8ffe8] px-5 py-16 overflow-x-hidden">
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div className="lb-a1 text-center mb-14">
          <h1
            className="lb-syne lb-a2"
            style={{
              fontSize: "clamp(1.8rem,4vw,4rem)",
              fontWeight: 800,
              color: "#5fff60",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Leaderboard
          </h1>
          <p
            className="lb-root lb-a3"
            style={{
              fontSize: "0.72rem",
              color: "rgba(180,220,180,.45)",
              marginTop: "0.5rem",
              letterSpacing: "0.04em",
            }}
          >
            Compete with the best minds and claim your throne
          </p>
        </div>

        {topThree.length > 0 && (
          <div style={{ marginBottom: "2.5rem" }}>
            <div
              className="hidden sm:grid"
              style={{
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "1rem",
                maxWidth: 1000,
                margin: "0 auto",
                alignItems: "flex-end",
              }}
            >
              {topThree[1] && <PodiumCard user={topThree[1]} place={2} />}
              {topThree[0] && (
                <div style={{ transform: "translateY(-16px)" }}>
                  <PodiumCard user={topThree[0]} place={1} />
                </div>
              )}
              {topThree[2] && <PodiumCard user={topThree[2]} place={3} />}
            </div>
            <div
              className="flex sm:hidden"
              style={{
                flexDirection: "column",
                gap: "0.75rem",
                maxWidth: 320,
                margin: "0 auto",
              }}
            >
              {topThree.map((u, i) => (
                <PodiumCard key={u._id} user={u} place={i + 1} />
              ))}
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <div className="lb-table-card">
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid rgba(95,255,96,.07)",
                background: "rgba(95,255,96,.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  className="lb-syne"
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Quest Ranking
                </div>
                <div
                  className="lb-root"
                  style={{
                    fontSize: "0.58rem",
                    color: "rgba(95,255,96,.38)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  Elite performers
                </div>
              </div>
              <div
                className="lb-root"
                style={{
                  fontSize: "0.58rem",
                  color: "rgba(95,255,96,.35)",
                  letterSpacing: "0.08em",
                }}
              >
                {leaderboard.length} competitors
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 400,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(95,255,96,.06)" }}>
                    {["Position", "Competitor", "Points"].map((h) => (
                      <th
                        key={h}
                        className="lb-root"
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          fontSize: "0.55rem",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "rgba(95,255,96,.38)",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rest.map((user, idx) => (
                    <tr
                      key={user._id}
                      className={`lb-row lb-row-anim ${
                        idx % 2 === 0 ? "" : "lb-row-alt"
                      }`}
                      style={{
                        borderBottom: "1px solid rgba(95,255,96,.04)",
                        animationDelay: `${idx * 0.04}s`,
                      }}
                    >
                      <td style={{ padding: "0.7rem 1rem" }}>
                        <div className="lb-rank-badge">{idx + 4}</div>
                      </td>
                      <td style={{ padding: "0.7rem 1rem", maxWidth: 260 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background: "rgba(95,255,96,.07)",
                              border: "1px solid rgba(95,255,96,.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span
                              className="lb-syne"
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 800,
                                color: "#5fff60",
                              }}
                            >
                              {user.name?.[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              className="lb-syne"
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 800,
                                color: "#fff",
                                letterSpacing: "-0.01em",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {user.name}
                            </div>
                            <div
                              className="lb-root"
                              style={{
                                fontSize: "0.58rem",
                                color: "rgba(180,220,180,.35)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{ padding: "0.7rem 1rem", whiteSpace: "nowrap" }}
                      >
                        <span
                          className="lb-syne"
                          style={{
                            fontSize: "1rem",
                            fontWeight: 800,
                            color: "#5fff60",
                          }}
                        >
                          {user.points}
                        </span>
                        <span
                          className="lb-root"
                          style={{
                            fontSize: "0.55rem",
                            color: "rgba(95,255,96,.38)",
                            marginLeft: 4,
                          }}
                        >
                          pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
