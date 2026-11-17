import { useEffect, useRef } from "react";
import {
  AmbientLight,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  SphereGeometry,
  WebGLRenderer,
  type Material,
  type Object3D,
} from "three";
import { makeEarthTextures, makeSunTexture } from "./textures";

/**
 * 3D 장면. react-three-fiber 없이 three 의 필요한 부분만 가져와서 묶음 크기를 줄였습니다.
 * 화면이 보이지 않으면(백그라운드) 그리기를 멈춥니다.
 */
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

type Built = {
  scene: Scene;
  ambient: AmbientLight;
  sunLight: DirectionalLight;
  globeMaterial: MeshStandardMaterial;
  earthGroup: Group;
  moon: Mesh;
  system: Group;
  dispose: () => void;
};

function build(): Built {
  const scene = new Scene();
  scene.background = new Color("#0b1220");
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  const ambient = new AmbientLight(0xffffff, 0.22);
  const sunLight = new DirectionalLight(0xffffff, 1.6);
  sunLight.position.set(6, 2, 4);
  scene.add(ambient, sunLight);

  const count = 700;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = 28 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const starGeometry = track(new BufferGeometry());
  starGeometry.setAttribute("position", new BufferAttribute(positions, 3));
  scene.add(new Points(starGeometry, track(new PointsMaterial({ color: "#f4f7fb", size: 0.045, sizeAttenuation: true }))));

  const maps = makeEarthTextures();
  track(maps.day);
  track(maps.night);
  const globeMaterial = track(
    new MeshStandardMaterial({ map: maps.day, emissiveMap: maps.night, emissive: new Color("#ffffff"), emissiveIntensity: 0.18, roughness: 1, metalness: 0 }),
  );
  const makeGlobe = () => {
    const group = new Group();
    group.add(new Mesh(track(new SphereGeometry(0.72, 48, 32)), globeMaterial));
    const halo = new Mesh(track(new SphereGeometry(0.72, 32, 24)), track(new MeshBasicMaterial({ color: "#8fb7e6", transparent: true, opacity: 0.12, side: BackSide })));
    halo.scale.setScalar(1.04);
    group.add(halo);
    return group;
  };

  const earthGroup = makeGlobe();
  scene.add(earthGroup);

  const moon = new Mesh(track(new SphereGeometry(0.2, 24, 16)), track(new MeshStandardMaterial({ color: "#c5c8ce", roughness: 1 })));
  moon.position.set(2.15, 0.15, 0.4);
  scene.add(moon);

  const system = new Group();
  const sunTexture = track(makeSunTexture());
  system.add(new Mesh(track(new SphereGeometry(0.7, 32, 24)), track(new MeshBasicMaterial({ map: sunTexture }))));
  PLANETS.forEach((planet, index) => {
    const holder = new Group();
    holder.position.set(...orbitPosition(planet.au, index));
    if (planet.name === "지구") {
      const small = makeGlobe();
      small.scale.setScalar(0.22);
      holder.add(small);
    } else {
      holder.add(new Mesh(track(new SphereGeometry(planet.radius, 24, 16)), track(new MeshStandardMaterial({ color: planet.color, roughness: 1 }))));
    }
    if (planet.ring) {
      const ring = new Mesh(
        track(new RingGeometry(planet.radius * 1.4, planet.radius * 2.1, 48)),
        track(new MeshBasicMaterial({ color: "#e6d3a3", side: DoubleSide, transparent: true, opacity: 0.85 })),
      );
      ring.rotation.x = Math.PI / 2.4;
      holder.add(ring);
    }
    system.add(holder);
  });
  scene.add(system);

  return {
    scene,
    ambient,
    sunLight,
    globeMaterial,
    earthGroup,
    moon,
    system,
    dispose: () => {
      scene.traverse((object: Object3D) => {
        const material = (object as Mesh).material as Material | Material[] | undefined;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
      });
      disposables.forEach((item) => item.dispose());
    },
  };
}

export function EarthScene({ mode, night }: { mode: JourneyMode; night: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const builtRef = useRef<Built | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const renderer = new WebGLRenderer({ antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    const canvas = renderer.domElement;
    canvas.style.touchAction = "none";
    host.appendChild(canvas);
    const camera = new PerspectiveCamera(45, 1, 0.1, 200);
    const built = build();
    builtRef.current = built;

    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      renderer.setSize(width, height, false);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const angles = { theta: 0.45, phi: 1.15 };
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };
    const onUp = () => {
      dragging = false;
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      angles.theta -= (event.clientX - lastX) * 0.005;
      angles.phi = Math.min(2.2, Math.max(0.35, angles.phi + (event.clientY - lastY) * 0.005));
      lastX = event.clientX;
      lastY = event.clientY;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointermove", onMove);

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      if (!dragging) angles.theta += delta * 0.08;
      const current = modeRef.current;
      const radius = current === "earth" ? 2.35 : current === "moon" ? 4.4 : 16;
      camera.position.set(
        radius * Math.sin(angles.phi) * Math.sin(angles.theta),
        radius * Math.cos(angles.phi),
        radius * Math.sin(angles.phi) * Math.cos(angles.theta),
      );
      camera.lookAt(0, 0, 0);
      renderer.render(built.scene, camera);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointermove", onMove);
      built.dispose();
      renderer.dispose();
      canvas.remove();
      builtRef.current = null;
    };
  }, []);

  useEffect(() => {
    const built = builtRef.current;
    if (!built) return;
    built.earthGroup.visible = mode !== "system";
    built.moon.visible = mode === "moon";
    built.system.visible = mode === "system";
    built.ambient.intensity = night ? 0.08 : 0.22;
    built.sunLight.intensity = night ? 0.25 : 1.6;
    built.globeMaterial.emissiveIntensity = night ? 1.15 : 0.18;
  }, [mode, night]);

  return <div ref={hostRef} style={{ width: "100%", height: "100%" }} />;
}
