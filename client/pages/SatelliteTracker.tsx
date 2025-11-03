import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

interface SatelliteData {
  id: string | number;
  name: string;
  lat: number;
  lon: number;
  altKm: number;
  status: string;
}

function Satellite({ data }: { data: SatelliteData }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const radius = 1 + (data.altKm / 6371) * 10; // exaggerate altitude
    const t = clock.getElapsedTime() * 0.5;

    const phi = (90 - data.lat) * (Math.PI / 180);
    const theta = (data.lon + 180) * (Math.PI / 180) + t;

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

function RotatingEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const texture = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
  );

  useFrame(({ clock }) => {
    if (earthRef.current) earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function SatelliteTracker() {
  const controlsRef = useRef<any>(null);
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);

  useEffect(() => {
    // Dummy data for testing
    const dummySatellites: SatelliteData[] = [
      { id: 1, name: "Sat-A", lat: 10, lon: 45, altKm: 500, status: "active" },
      { id: 2, name: "Sat-B", lat: -20, lon: 120, altKm: 700, status: "active" },
      { id: 3, name: "Sat-C", lat: 50, lon: -60, altKm: 800, status: "active" },
      { id: 4, name: "Sat-D", lat: 0, lon: 0, altKm: 600, status: "active" },
    ];

    setSatellites(dummySatellites);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-orbitron text-foreground mb-4 glow-text">
          Satellite Tracker
        </h1>
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
        </div>
      </div>
    </div>
  );
}
