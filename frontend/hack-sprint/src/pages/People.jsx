import React, { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import toast from "react-hot-toast";
import { X, Send, Users as UsersIcon } from "lucide-react";
import { PeopleAPI } from "../api/people.api.js";
import SEO from "../components/SEO.jsx";

// A fixed, high-contrast palette, cycled across the decorative blobs below.
const PALETTE = [
  "#5fff60", "#60c8ff", "#ff6bcb", "#ffb84d", "#b478ff",
  "#ff6060", "#4dd9c9", "#f5d90a", "#ff9d4d", "#7c9eff",
];

const DEFAULT_AVATAR = (seed) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;

// Deterministic pseudo-random in [0,1) from a string seed, so cluster
// centroids stay stable across re-renders of the same data instead of
// jumping around every time React re-computes the memo.
const seededRandom = (seed) => {
  // The hash loop below can land on a negative 32-bit int (bitwise ops are
  // signed), and JS's `%` keeps the dividend's sign — so an unguarded
  // `h % 233280` can come back negative, which silently turns into a
  // negative array index wherever this feeds a `blobs[...]` lookup. Only
  // showed up once real data pushed the total draw count into the
  // thousands; two test users never hit it.
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return () => {
    h = (h * 9301 + 49297) % 233280;
    return (((h % 233280) + 233280) % 233280) / 233280;
  };
};

// Purely visual grouping — not tied to skills or any other real attribute.
// Most profiles won't have skills filled in, so clustering by them would
// just dump almost everyone into one bucket. This is about interaction with
// people broadly, not skill-matching, so each person is randomly (but
// stably, seeded by their own id) assigned a color and a blob to sit in —
// gives the same colorful-cluster look as the reference image without
// implying any meaning behind the grouping.
const BLOB_COUNT = 8;

const buildScene = (people) => {
  const blobs = Array.from({ length: BLOB_COUNT }, (_, i) => {
    const radius = 6;
    const t = BLOB_COUNT > 1 ? i / (BLOB_COUNT - 1) : 0.5;
    const phi = Math.acos(1 - 2 * t);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;

    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi),
      color: PALETTE[i % PALETTE.length],
    };
  });

  // Spread scales with how many people actually land in each blob (volume
  // grows with the cube of radius, so cube-root keeps density roughly
  // constant) — otherwise a real userbase in the thousands packs so tightly
  // into a fixed-size blob that individual people become indistinguishable
  // and the whole thing reads as a handful of solid blurry clumps instead
  // of many clickable individuals.
  const avgPerBlob = Math.max(people.length / BLOB_COUNT, 1);
  const jitter = 1.3 * Math.cbrt(avgPerBlob);

  const points = people.map((p) => {
    const rand = seededRandom(p._id);
    const blobIndex = Math.min(Math.max(Math.floor(rand() * BLOB_COUNT), 0), BLOB_COUNT - 1);
    const blob = blobs[blobIndex];

    return {
      ...p,
      color: blob.color,
      position: [
        blob.x + (rand() - 0.5) * jitter,
        blob.y + (rand() - 0.5) * jitter,
        blob.z + (rand() - 0.5) * jitter,
      ],
    };
  });

  return { points };
};

const PersonPoint = ({ point, onSelect, isSelected }) => {
  const scale = isSelected ? 0.28 : 0.16;

  return (
    <mesh
      position={point.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(point);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[scale, 12, 12]} />
      <meshStandardMaterial
        color={point.color}
        emissive={point.color}
        emissiveIntensity={isSelected ? 0.9 : 0.4}
      />
    </mesh>
  );
};

const ProfileCard = ({ person, onClose, onSent }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || sending || sent) return;
    setSending(true);
    try {
      await PeopleAPI.sendMessage(person._id, message.trim());
      setSent(true);
      onSent(person._id);
      toast.success(`Message sent to ${person.name}`);
    } catch (err) {
      if (err.response?.status === 409) {
        setSent(true);
        toast.error("You've already reached out to this person");
      } else if (err.response?.status === 401) {
        toast.error("Log in to message someone");
      } else {
        toast.error("Couldn't send that — try again");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-80 bg-[rgba(8,10,8,0.97)] border border-[rgba(95,255,96,0.2)] rounded-[4px] shadow-[0_8px_40px_rgba(0,0,0,0.7)] p-4 z-10">
      <button
        onClick={onClose}
        className="absolute top-2.5 right-2.5 text-[rgba(180,220,180,0.4)] hover:text-white cursor-pointer"
      >
        <X size={15} />
      </button>

      <div className="flex items-center gap-3 mb-3">
        <img
          src={person.image?.url || DEFAULT_AVATAR(person.userName || person._id)}
          alt=""
          className="w-12 h-12 rounded-full object-cover border-2 flex-shrink-0"
          style={{ borderColor: person.color }}
        />
        <div className="min-w-0">
          {person.userName ? (
            <a
              href={`/u/${person.userName}`}
              className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-sm truncate hover:text-[#5fff60] block"
            >
              {person.name}
            </a>
          ) : (
            <p className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-sm truncate">
              {person.name}
            </p>
          )}
          {person.userName && (
            <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(180,220,180,0.45)]">
              @{person.userName}
            </span>
          )}
        </div>
      </div>

      {person.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {person.skills.slice(0, 6).map((s) => (
            <span
              key={s}
              className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] uppercase tracking-[0.05em] px-2 py-0.5 rounded-[2px] border"
              style={{ borderColor: `${person.color}55`, color: person.color, background: `${person.color}12` }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {sent ? (
        <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(95,255,96,0.7)] bg-[rgba(95,255,96,0.06)] border border-[rgba(95,255,96,0.2)] rounded-[3px] px-3 py-2 text-center">
          Message sent — that's your one message to this profile.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Say hi, propose teaming up, or ask a question — one message only."
            maxLength={500}
            rows={3}
            className="w-full bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.15)] rounded-[3px] px-2.5 py-2 text-[0.68rem] text-white placeholder:text-[rgba(180,220,180,0.3)] outline-none focus:border-[rgba(95,255,96,0.4)] resize-none font-[family-name:'JetBrains_Mono',monospace]"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="self-end inline-flex items-center gap-1.5 font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] tracking-[0.06em] uppercase px-3.5 py-2 rounded-[3px] bg-[#5fff60] text-[#050905] font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-[#7fff80] transition-colors"
          >
            {sending ? "Sending…" : "Send"} <Send size={11} />
          </button>
        </div>
      )}
    </div>
  );
};

export default function PeoplePage() {
  const [people, setPeople] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    PeopleAPI.getCluster()
      .then((res) => setPeople(res.data.people || []))
      .catch(() => setError("Couldn't load the People directory. Try again later."));
  }, []);

  const { points } = useMemo(() => buildScene(people || []), [people]);

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <SEO
        title="People"
        description="Explore HackSprint's community and reach out to teammates — a live 3D map of every person on the platform."
        path="/people"
      />

      <div className="max-w-[1400px] mx-auto px-5 py-10">
        <div className="font-[family-name:'JetBrains_Mono',monospace] inline-block text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-3 py-[0.22rem] rounded-[2px] mb-4">
          Community
        </div>
        <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white tracking-tight leading-[1.05] mb-3" style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>
          The <span className="text-[#5fff60]">People</span> of HackSprint
        </h1>
        <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.75rem] text-[rgba(180,220,180,0.5)] leading-relaxed max-w-xl mb-6">
          Every dot is a real person on HackSprint. Drag to rotate, scroll to zoom, click anyone
          to say hi — you get exactly one message per profile, so make it count.
        </p>

        <div className="relative bg-[rgba(255,255,255,0.015)] border border-[rgba(95,255,96,0.14)] rounded-[8px] overflow-hidden" style={{ height: "min(70vh, 640px)" }}>
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-[rgba(180,220,180,0.4)] font-[family-name:'JetBrains_Mono',monospace] text-xs">
              {error}
            </div>
          ) : !people ? (
            <div className="absolute inset-0 flex items-center justify-center text-[rgba(180,220,180,0.4)] font-[family-name:'JetBrains_Mono',monospace] text-xs">
              Loading the cluster…
            </div>
          ) : people.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[rgba(180,220,180,0.4)] font-[family-name:'JetBrains_Mono',monospace] text-xs">
              <UsersIcon size={22} className="opacity-40" />
              No one's opted into the directory yet.
            </div>
          ) : (
            <>
              <Canvas
                camera={{ position: [0, 0, 20], fov: 50 }}
                onPointerMissed={() => setSelected(null)}
              >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.2} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                {points.map((p) => (
                  <PersonPoint
                    key={p._id}
                    point={p}
                    isSelected={selected?._id === p._id}
                    onSelect={setSelected}
                  />
                ))}
                <OrbitControls
                  enablePan={false}
                  minDistance={6}
                  maxDistance={35}
                  autoRotate
                  autoRotateSpeed={0.4}
                />
              </Canvas>

              {selected && (
                <ProfileCard
                  person={selected}
                  onClose={() => setSelected(null)}
                  onSent={() => {}}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
