import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";

export const CyberGlobe3D: React.FC<{ className?: string }> = ({ className = "h-[145px] w-[260px]" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 260;
    const height = container.clientHeight || 145;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    const isDark = theme === "dark";
    const primaryColor = new THREE.Color(isDark ? 0xff5722 : 0xf97316);
    const nodeColor = new THREE.Color(isDark ? 0x38bdf8 : 0x0284c7);
    const threatColor = new THREE.Color(0xef4444);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Particle Sphere (Globe Dots)
    const particleCount = 750;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const radius = 5.8;
    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation
      const isOrange = Math.random() > 0.8;
      const c = isOrange ? primaryColor : nodeColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.75 : 0.6,
    });

    const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    globeGroup.add(particlePoints);

    // 2. Wireframe Inner Core
    const wireGeo = new THREE.IcosahedronGeometry(radius * 0.98, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x172554 : 0xbfdbfe,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.15 : 0.25,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // 3. Threat Beacon Nodes & Curved Arcs
    const beacons: { mesh: THREE.Mesh; pulse: number }[] = [];
    const beaconCoords = [
      { lat: 35.6762, lon: 139.6503 }, // Tokyo
      { lat: 40.7128, lon: -74.006 }, // NYC
      { lat: 51.5074, lon: -0.1278 }, // London
      { lat: 19.076, lon: 72.8777 }, // Mumbai
      { lat: 50.1109, lon: 8.6821 }, // Frankfurt
    ];

    const latLonToVector3 = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    };

    const beaconGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: threatColor });

    const beaconPoints: THREE.Vector3[] = [];
    beaconCoords.forEach((coord, i) => {
      const pos = latLonToVector3(coord.lat, coord.lon, radius * 1.01);
      beaconPoints.push(pos);
      const bMesh = new THREE.Mesh(beaconGeo, beaconMat.clone());
      bMesh.position.copy(pos);
      globeGroup.add(bMesh);
      beacons.push({ mesh: bMesh, pulse: i * 0.5 });
    });

    // 4. Attack Arcs between beacons
    for (let i = 0; i < beaconPoints.length - 1; i++) {
      const p1 = beaconPoints[i];
      const p2 = beaconPoints[i + 1];
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const distance = p1.distanceTo(p2);
      mid.setLength(radius + distance * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const curvePoints = curve.getPoints(32);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0xff5722 : 0xef4444,
        transparent: true,
        opacity: isDark ? 0.7 : 0.5,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arcLine);
    }

    // 5. Orbiting Cyber Ring
    const ringGeo = new THREE.RingGeometry(radius * 1.3, radius * 1.33, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xff5722 : 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isDark ? 0.25 : 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    globeGroup.add(ringMesh);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth slow rotation
      globeGroup.rotation.y += delta * 0.22;
      globeGroup.rotation.x = Math.sin(time * 0.3) * 0.08;

      // Pulse beacon sizes
      beacons.forEach((b) => {
        const s = 1 + 0.35 * Math.sin(time * 3 + b.pulse);
        b.mesh.scale.set(s, s, s);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [theme]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Telemetry Stats Badge */}
      <div className="absolute bottom-1 right-2 px-2 py-0.5 rounded-md bg-[var(--bg-card)]/80 border border-[var(--border-main)] backdrop-blur-md text-[9px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5 shadow-md pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[var(--text-primary)] font-bold">236</span>
        <span>NODES MAPPED</span>
      </div>
    </div>
  );
};
