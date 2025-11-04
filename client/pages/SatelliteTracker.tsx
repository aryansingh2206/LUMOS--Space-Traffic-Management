import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";

interface SatelliteData {
  id: string | number;
  name: string;
  lat: number;
  lon: number;
  altKm: number;
  status: string;
}

/* ---------- Helpers ---------- */
function isFiniteNum(n: any) {
  return typeof n === "number" && Number.isFinite(n);
}

function sanitizeSat(s: any): SatelliteData | null {
  const lat = Number(s.lat);
  const lon = Number(s.lon);
  const alt = Number(s.altKm);
  if (!isFiniteNum(lat) || !isFiniteNum(lon) || !isFiniteNum(alt)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lon < -180 || lon > 180) return null;
  return {
    id: String(s.id ?? s._id ?? s.name ?? Math.random()),
    name: String(s.name ?? "Unknown"),
    lat,
    lon,
    altKm: Math.max(100, alt),
    status: String(s.status ?? "active"),
  };
}

/* ---------- Deterministic phase/altitude offset to prevent overlap ---------- */
function phaseFromId(id: string | number) {
  const s = String(id);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h % 360) * (Math.PI / 180); // radians
}

function altJitterKm(id: string | number) {
  const s = String(id);
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  return ((sum % 7) - 3) * 2; // -6..+6 km spread
}

/* ---------- Satellite Mesh ---------- */
function Satellite({ data }: { data: SatelliteData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = phaseFromId(data.id);
  const altJitter = altJitterKm(data.id);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const radius = 1 + ((data.altKm + altJitter) / 6371) * 10;
    const t = clock.getElapsedTime() * 0.5;

    const phi = (90 - data.lat) * (Math.PI / 180);
    const theta = (data.lon + 180) * (Math.PI / 180) + t + phase;

    meshRef.current.position.set(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={0.7} />
    </mesh>
  );
}

/* ---------- Rotating Earth ---------- */
function RotatingEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const texture = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
  );

  useFrame(({ clock }) => {
    if (earthRef.current)
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

/* ---------- Main Component ---------- */
export default function SatelliteTracker() {
  const controlsRef = useRef<any>(null);
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/api/satellites/active");
        const clean = (Array.isArray(res.data) ? res.data : [])
          .map(sanitizeSat)
          .filter(Boolean) as SatelliteData[];
        if (!cancelled) setSatellites(clean);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setErrorText(e?.message || "Failed to load satellites");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-orbitron text-foreground mb-4 glow-text">
          Satellite Tracker
        </h1>
        {errorText && (
          <div className="mb-2 text-xs text-muted-foreground">
            Error: {errorText}
          </div>
        )}
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="h-[500px]">
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
              <Stars radius={300} depth={60} count={20000} factor={7} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 3, 5]} intensity={1} />
              <RotatingEarth />
              {satellites.map((sat) => (
                <Satellite key={sat.id} data={sat} />
              ))}
              <OrbitControls ref={controlsRef} enableZoom />
            </Canvas>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Rendering {satellites.length} active satellites
          </div>
        </div>
      </div>
    </div>
  );
}
