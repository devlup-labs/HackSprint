import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COLORS = ["#22c55e", "#38bdf8", "#f472b6", "#fbbf24", "#a78bfa", "#fb7185", "#2dd4bf"];

// Evenly spread points on a sphere (golden-angle spiral), plus a faint line
// between every pair that sits close together — reads as a network without
// any per-person textures, so it stays cheap at any community size.
const buildNetwork = (count, radius) => {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = Math.PI * (3 - Math.sqrt(5)) * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  const lines = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (pts[i].distanceTo(pts[j]) < radius * 0.62) lines.push(pts[i], pts[j]);
    }
  }
  return { pts, lineGeometry: new THREE.BufferGeometry().setFromPoints(lines) };
};

const Network = ({ count = 70, radius = 2 }) => {
  const group = useRef();
  const { pts, lineGeometry } = useMemo(() => buildNetwork(count, radius), [count, radius]);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.18;
      group.current.rotation.x = 0.25;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#22c55e" transparent opacity={0.28} />
      </lineSegments>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[i % 7 === 0 ? 0.085 : 0.05, 10, 10]} />
          <meshBasicMaterial color={COLORS[i % COLORS.length]} />
        </mesh>
      ))}
    </group>
  );
};

const PeopleGlobe = () => (
  <Canvas camera={{ position: [0, 0, 6.2], fov: 45 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
    <Network />
  </Canvas>
);

export default PeopleGlobe;
