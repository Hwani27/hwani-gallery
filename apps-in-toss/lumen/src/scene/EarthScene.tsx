import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeEarthTextures, makeSunTexture } from "./textures";

export type JourneyMode = "earth" | "moon" | "system";

const PLANETS: { name: string; au: number; color: string; radius: number; ring?: boolean }[] = [
  { name: "수성", au: 0.39, color: "#b5ada4", radius: 0.08 },
  { name: "금성", au: 0.72, color: "#e0c48a", radius: 0.12 },
  { name: "지구", au: 1, color: "#2f6fad", radius: 0.13 },
  { name: "화성", au: 1.52, color: "#c15b3c", radius: 0.1 },
  { name: "목성", au: 5.2, color: "#d2a679", radius: 0.32 },
  { name: "토성", au: 9.58, color: "#e6d3a3", radius: 0.26, ring: true },
  { name: "천왕성", au: 19.2, color: "#8fd0cb", radius: 0.18 },
  { name: "해왕성", au: 30.05, color: "#3d6ea5", radius: 0.18 },
];

function orbitPosition(au: number, index: number): [number, number, number] {
  const radius = 2.4 + Math.log10(au + 0.2) * 5.2;
  const angle = index * 0.78;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
}

function Rig({ mode }: { mode: JourneyMode }) {
  const angles = useRef({ theta: 0.45, phi: 1.15 });
  const dragging = useRef(false);
  const target = mode === "system" ? 0 : 0;

  useEffect(() => {
    const el = document.querySelector<HTMLCanvasElement>(".journey-stage canvas");
    if (!el) return;
    const onDown = (event: PointerEvent) => {
      dragging.current = true;
      el.setPointerCapture(event.pointerId);
    };
    const onUp = () => {
      dragging.current = false;
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      angles.current.theta -= event.movementX * 0.005;
      angles.current.phi = Math.min(2.2, Math.max(0.35, angles.current.phi + event.movementY * 0.005));
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointermove", onMove);
    };
  }, [mode]);

  useFrame(({ camera }, delta) => {
    if (!dragging.current) angles.current.theta += delta * 0.08;
    const radius = mode === "earth" ? 2.35 : mode === "moon" ? 4.4 : 16;
    const { theta, phi } = angles.current;
    camera.position.set(
      target + radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.cos(theta),
    );
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Stars() {
  const positions = useMemo(() => {
    const count = 700;
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 28 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      data[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      data[i * 3 + 1] = radius * Math.cos(phi);
      data[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return data;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f4f7fb" size={0.045} sizeAttenuation />
    </points>
  );
}

function Globe({ night }: { night: boolean }) {
  const maps = useMemo(() => makeEarthTextures(), []);
  useEffect(() => () => {
    maps.day.dispose();
    maps.night.dispose();
  }, [maps]);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.72, 48, 32]} />
        <meshStandardMaterial
          map={maps.day}
          emissiveMap={maps.night}
          emissive="#ffffff"
          emissiveIntensity={night ? 1.15 : 0.18}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh scale={1.04}>
        <sphereGeometry args={[0.72, 32, 24]} />
        <meshBasicMaterial color="#8fb7e6" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function System({ night }: { night: boolean }) {
  const sun = useMemo(() => makeSunTexture(), []);
  useEffect(() => () => sun.dispose(), [sun]);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.7, 32, 24]} />
        <meshBasicMaterial map={sun} />
      </mesh>
      {PLANETS.map((planet, index) => {
        const position = orbitPosition(planet.au, index);
        const earth = planet.name === "지구";
        return (
          <group key={planet.name} position={position}>
            {earth ? (
              <group scale={0.22}>
                <Globe night={night} />
              </group>
            ) : (
              <mesh>
                <sphereGeometry args={[planet.radius, 24, 16]} />
                <meshStandardMaterial color={planet.color} roughness={1} />
              </mesh>
            )}
            {planet.ring ? (
              <mesh rotation={[Math.PI / 2.4, 0, 0]}>
                <ringGeometry args={[planet.radius * 1.4, planet.radius * 2.1, 48]} />
                <meshBasicMaterial color="#e6d3a3" side={THREE.DoubleSide} transparent opacity={0.85} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

function Stage({ mode, night }: { mode: JourneyMode; night: boolean }) {
  return (
    <>
      <color attach="background" args={["#0b1220"]} />
      <ambientLight intensity={night ? 0.08 : 0.22} />
      <directionalLight position={[6, 2, 4]} intensity={night ? 0.25 : 1.6} />
      <Stars />
      <Rig mode={mode} />
      {mode === "system" ? <System night={night} /> : <Globe night={night} />}
      {mode === "moon" ? (
        <mesh position={[2.15, 0.15, 0.4]}>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshStandardMaterial color="#c5c8ce" roughness={1} />
        </mesh>
      ) : null}
    </>
  );
}

export function EarthScene({ mode, night }: { mode: JourneyMode; night: boolean }) {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0.6, 2.6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "low-power" }}
    >
      <Stage mode={mode} night={night} />
    </Canvas>
  );
}
