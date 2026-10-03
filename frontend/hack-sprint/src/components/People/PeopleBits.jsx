import React from "react";

const HUES = [152, 200, 330, 38, 262, 350, 172];

export const hueFor = (id = "") => HUES[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];

export const Avatar = ({ person, size = 56 }) => {
  const hue = hueFor(person._id);
  return person.image?.url ? (
    <img
      src={person.image.url}
      alt=""
      loading="lazy"
      width={size}
      height={size}
      className="rounded-full object-cover flex-shrink-0 ring-2 ring-background"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="rounded-full flex items-center justify-center font-display font-extrabold text-white flex-shrink-0 ring-2 ring-background"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${hue} 70% 38%))`,
      }}
    >
      {person.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
};
