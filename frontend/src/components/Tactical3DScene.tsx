import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  Plus,
  Minus,
  RotateCcw,
  Play,
  Pause,
  Maximize2,
  Filter,
  Globe,
  Shield,
  Server,
  Cloud,
  Layers,
  Key,
  Database,
  Crosshair,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
} from "lucide-react";
import { Asset, Relationship } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

interface Tactical3DSceneProps {
  assets?: Asset[];
  relationships?: Relationship[];
  selectedAssetId?: string;
  onSelectAsset?: (asset: Asset) => void;
  highlightPath?: string[];
  compromisedNodes?: string[];
  height?: string;
}

interface EnterpriseNode {
  id: string;
  name: string;
  type: string;
  zone: string;
  x: number; // 2D x
  y: number; // 2D y
  pos3D: [number, number, number]; // 3D position [x, y, z]
  color: string;
  status: "normal" | "at_risk" | "compromised";
  chokePointScore: number;
  compromiseScore: number;
  cves: string[];
  ip: string;
  os: string;
  assetCount: number;
}

export const Tactical3DScene: React.FC<Tactical3DSceneProps> = ({
  selectedAssetId,
  onSelectAsset,
  height = "h-[420px]",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D");
  const [directionFilter, setDirectionFilter] = useState<"Inbound" | "Outbound">("Outbound");
  const [activeNode, setActiveNode] = useState<EnterpriseNode | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<{
    isDragging: boolean;
    prevMouse: { x: number; y: number };
    spherical: { radius: number; theta: number; phi: number };
    target: THREE.Vector3;
  }>({
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    spherical: { radius: 36, theta: Math.PI / 4, phi: Math.PI / 3.4 },
    target: new THREE.Vector3(0, 0, 0),
  });

  // Enterprise Nodes matching the reference screenshot layout
  const enterpriseNodes: EnterpriseNode[] = [
    {
      id: "EXT-INET-01",
      name: "External Internet",
      type: "Breach Point",
      zone: "WAN",
      x: 70,
      y: 190,
      pos3D: [-14, 0, 8],
      color: "#38BDF8",
      status: "normal",
      chokePointScore: 40,
      compromiseScore: 10,
      cves: ["CVE-2023-46604"],
      ip: "198.51.100.24",
      os: "Edge Gateway",
      assetCount: 1,
    },
    {
      id: "OFFICE-LAN",
      name: "Office Network",
      type: "User Subnet",
      zone: "CORP",
      x: 230,
      y: 80,
      pos3D: [-7, 0, -8],
      color: "#38BDF8",
      status: "normal",
      chokePointScore: 50,
      compromiseScore: 35,
      cves: ["CVE-2021-34527"],
      ip: "10.10.0.0/24",
      os: "Workstations & Laptops",
      assetCount: 12,
    },
    {
      id: "CLOUD-AWS",
      name: "Cloud (AWS)",
      type: "Cloud Infrastructure",
      zone: "CLOUD",
      x: 430,
      y: 60,
      pos3D: [5, 0, -12],
      color: "#38BDF8",
      status: "normal",
      chokePointScore: 70,
      compromiseScore: 20,
      cves: [],
      ip: "172.31.0.0/16",
      os: "Amazon VPC / EKS",
      assetCount: 28,
    },
    {
      id: "WEB-TIER-01",
      name: "Web Tier",
      type: "Application Ingress",
      zone: "DMZ",
      x: 340,
      y: 190,
      pos3D: [-3, 0, 0],
      color: "#FF9800",
      status: "at_risk",
      chokePointScore: 85,
      compromiseScore: 78,
      cves: ["CVE-2023-46604", "T1190"],
      ip: "10.0.10.5",
      os: "Ubuntu 22.04 / Nginx",
      assetCount: 8,
    },
    {
      id: "ID-CORP-AD",
      name: "Identity (AD)",
      type: "Directory Chokepoint",
      zone: "INTERNAL",
      x: 320,
      y: 300,
      pos3D: [-8, 0, 6],
      color: "#38BDF8",
      status: "normal",
      chokePointScore: 98,
      compromiseScore: 82,
      cves: ["T1003", "Kerberoasting"],
      ip: "10.10.1.10",
      os: "Windows Server 2022",
      assetCount: 6,
    },
    {
      id: "APP-TIER-01",
      name: "App Tier",
      type: "Microservices Core",
      zone: "INTERNAL",
      x: 520,
      y: 180,
      pos3D: [4, 0, -1],
      color: "#38BDF8",
      status: "normal",
      chokePointScore: 80,
      compromiseScore: 75,
      cves: ["T1068", "Overprivileged Token"],
      ip: "10.10.20.15",
      os: "Kubernetes Cluster",
      assetCount: 15,
    },
    {
      id: "CRIT-VAULT-01",
      name: "Critical Assets",
      type: "Tier-0 Crown Jewel",
      zone: "SECURE_TIER",
      x: 650,
      y: 280,
      pos3D: [8, 0, 7],
      color: "#EF4444",
      status: "compromised",
      chokePointScore: 100,
      compromiseScore: 99,
      cves: ["T1041", "Crown Jewel Reachable"],
      ip: "10.10.99.1",
      os: "HSM Vault & Core",
      assetCount: 3,
    },
    {
      id: "DB-PRIMARY",
      name: "Database",
      type: "Core Data Store",
      zone: "SECURE_TIER",
      x: 770,
      y: 110,
      pos3D: [15, 0, -4],
      color: "#EF4444",
      status: "compromised",
      chokePointScore: 92,
      compromiseScore: 95,
      cves: ["T1021", "Weak Vault Segregation"],
      ip: "10.10.30.4",
      os: "PostgreSQL HA Cluster",
      assetCount: 4,
    },
  ];

  // 2D & 3D Connections
  const attackPathEdges = [
    { from: "EXT-INET-01", to: "WEB-TIER-01" },
    { from: "WEB-TIER-01", to: "APP-TIER-01" },
    { from: "APP-TIER-01", to: "CRIT-VAULT-01" },
    { from: "CRIT-VAULT-01", to: "DB-PRIMARY" },
  ];

  const trustEdges = [
    { from: "EXT-INET-01", to: "OFFICE-LAN" },
    { from: "OFFICE-LAN", to: "ID-CORP-AD" },
    { from: "CLOUD-AWS", to: "APP-TIER-01" },
    { from: "ID-CORP-AD", to: "APP-TIER-01" },
    { from: "APP-TIER-01", to: "DB-PRIMARY" },
  ];

  // Initialize Three.js 3D WebGL Scene
  useEffect(() => {
    if (viewMode !== "3D") return;
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight > 50 ? container.clientHeight : 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Dark cyber atmospheric fog
    scene.fog = new THREE.FogExp2(isDark ? 0x07090d : 0xf4f6fb, 0.018);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // Camera Positioning Function
    const updateCameraPos = () => {
      const { radius, theta, phi } = controlsRef.current.spherical;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.set(x, y, z);
      camera.lookAt(controlsRef.current.target);
    };
    updateCameraPos();

    // Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x1e293b : 0xffffff, isDark ? 0.9 : 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(isDark ? 0xffffff : 0x0284c7, 1.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Colored Accent Point Lights (matching the screenshot's glows)
    const orangeLight = new THREE.PointLight(0xff5722, 3, 20);
    orangeLight.position.set(-3, 4, 0);
    scene.add(orangeLight);

    const redLight = new THREE.PointLight(0xef4444, 4, 25);
    redLight.position.set(8, 4, 7);
    scene.add(redLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 2, 20);
    blueLight.position.set(4, 4, -1);
    scene.add(blueLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(60, 40, isDark ? 0x1e293b : 0xcbd5e1, isDark ? 0x111827 : 0xe2e8f0);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // 3D Nodes Meshes & Interactive Raycast Targets
    const interactiveObjects: THREE.Object3D[] = [];

    // Helper: Create Chamfered Pedestal
    const createPedestal = (pos: [number, number, number], colorHex: number, isCompromised: boolean) => {
      const group = new THREE.Group();
      group.position.set(pos[0], pos[1], pos[2]);

      // Base Plate
      const baseGeo = new THREE.BoxGeometry(3.6, 0.4, 3.6);
      const baseMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x0b0f19 : 0xffffff,
        roughness: 0.3,
        metalness: 0.8,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.2;
      group.add(baseMesh);

      // Glowing Neon Rim
      const rimGeo = new THREE.BoxGeometry(3.7, 0.08, 3.7);
      const rimMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: isDark ? 0.7 : 0.9,
      });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.y = 0.42;
      group.add(rimMesh);

      // Compromised or At-Risk Pulsing Ring
      if (isCompromised) {
        const ringGeo = new THREE.RingGeometry(2.2, 2.6, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 0.02;
        group.add(ringMesh);
      }

      scene.add(group);
      return group;
    };

    // Build specific 3D geometries for each node
    enterpriseNodes.forEach((node) => {
      const isCompromised = node.status === "compromised";
      const isAtRisk = node.status === "at_risk";
      const colorHex = isCompromised ? 0xef4444 : isAtRisk ? 0xff9800 : 0x38bdf8;

      const pedestal = createPedestal(node.pos3D, colorHex, isCompromised || isAtRisk);

      let nodeMesh: THREE.Object3D;

      if (node.id === "EXT-INET-01") {
        // Wireframe glowing globe
        const globeGroup = new THREE.Group();
        const wireGeo = new THREE.IcosahedronGeometry(1.2, 2);
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: true,
          transparent: true,
          opacity: 0.85,
        });
        const coreGeo = new THREE.SphereGeometry(0.6, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        globeGroup.add(new THREE.Mesh(wireGeo, wireMat));
        globeGroup.add(new THREE.Mesh(coreGeo, coreMat));
        globeGroup.position.set(node.pos3D[0], 1.8, node.pos3D[2]);
        scene.add(globeGroup);
        nodeMesh = globeGroup;
      } else if (node.id === "CLOUD-AWS") {
        // Stylized 3D cloud
        const cloudGroup = new THREE.Group();
        const sphereGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const cloudMat = new THREE.MeshStandardMaterial({
          color: isDark ? 0x1e293b : 0xe2e8f0,
          emissive: 0x0284c7,
          emissiveIntensity: 0.3,
          roughness: 0.2,
        });

        const c1 = new THREE.Mesh(sphereGeo, cloudMat);
        c1.scale.set(1.4, 0.9, 1);
        const c2 = new THREE.Mesh(sphereGeo, cloudMat);
        c2.position.set(-0.8, -0.2, 0);
        c2.scale.set(0.9, 0.8, 0.9);
        const c3 = new THREE.Mesh(sphereGeo, cloudMat);
        c3.position.set(0.8, -0.2, 0);
        c3.scale.set(0.9, 0.8, 0.9);

        cloudGroup.add(c1);
        cloudGroup.add(c2);
        cloudGroup.add(c3);
        cloudGroup.position.set(node.pos3D[0], 2.2, node.pos3D[2]);
        scene.add(cloudGroup);
        nodeMesh = cloudGroup;
      } else if (node.id === "DB-PRIMARY") {
        // Cylindrical Database Silo
        const dbGroup = new THREE.Group();
        const cylGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 32);
        const cylMat = new THREE.MeshStandardMaterial({
          color: 0x7f1d1d,
          emissive: 0xef4444,
          emissiveIntensity: 0.5,
          metalness: 0.8,
          roughness: 0.2,
        });
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        cyl.position.y = 1.4;
        dbGroup.add(cyl);

        // Tiered rings
        [-0.4, 0.4, 1.2].forEach((offsetY) => {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.25, 0.06, 16, 32),
            new THREE.MeshBasicMaterial({ color: 0xff3d00 })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 1.4 + offsetY;
          dbGroup.add(ring);
        });

        dbGroup.position.set(node.pos3D[0], 0, node.pos3D[2]);
        scene.add(dbGroup);
        nodeMesh = dbGroup;
      } else if (node.id === "CRIT-VAULT-01") {
        // Critical Crown Jewel Server Monolith + Rotating Reticle
        const critGroup = new THREE.Group();
        const boxGeo = new THREE.BoxGeometry(1.6, 3.2, 1.6);
        const boxMat = new THREE.MeshStandardMaterial({
          color: 0x450a0a,
          emissive: 0xef4444,
          emissiveIntensity: 0.6,
          roughness: 0.2,
          metalness: 0.9,
        });
        const tower = new THREE.Mesh(boxGeo, boxMat);
        tower.position.y = 1.8;
        critGroup.add(tower);

        // Crosshair reticle ring above
        const reticle = new THREE.Mesh(
          new THREE.RingGeometry(1.8, 1.95, 32),
          new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
        );
        reticle.rotation.x = Math.PI / 2;
        reticle.position.y = 0.5;
        critGroup.add(reticle);

        critGroup.position.set(node.pos3D[0], 0, node.pos3D[2]);
        scene.add(critGroup);
        nodeMesh = critGroup;
      } else {
        // Standard Server Towers (Web Tier, Office, Identity, App Tier)
        const towerGroup = new THREE.Group();
        const h = node.id === "WEB-TIER-01" ? 3.0 : node.id === "APP-TIER-01" ? 2.8 : 2.4;
        const boxGeo = new THREE.BoxGeometry(1.4, h, 1.4);
        const boxMat = new THREE.MeshStandardMaterial({
          color: isDark ? 0x0f172a : 0xf1f5f9,
          emissive: colorHex,
          emissiveIntensity: isAtRisk ? 0.6 : 0.25,
          metalness: 0.8,
          roughness: 0.3,
        });
        const tower = new THREE.Mesh(boxGeo, boxMat);
        tower.position.y = h / 2 + 0.3;
        towerGroup.add(tower);

        towerGroup.position.set(node.pos3D[0], 0, node.pos3D[2]);
        scene.add(towerGroup);
        nodeMesh = towerGroup;
      }

      // Attach metadata for raycaster
      (nodeMesh as any).userData = { node };
      interactiveObjects.push(nodeMesh);
    });

    // 4. Attack Spline Conduits (Red glowing tubes + moving pulse)
    const attackSplinePoints = [
      new THREE.Vector3(-14, 1.2, 8), // External Internet
      new THREE.Vector3(-3, 1.4, 0), // Web Tier
      new THREE.Vector3(4, 1.4, -1), // App Tier
      new THREE.Vector3(8, 1.6, 7), // Critical Assets
      new THREE.Vector3(15, 1.4, -4), // Database
    ];

    const attackCurve = new THREE.CatmullRomCurve3(attackSplinePoints);
    const attackTubeGeo = new THREE.TubeGeometry(attackCurve, 64, 0.14, 8, false);
    const attackTubeMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff3d00,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const attackTube = new THREE.Mesh(attackTubeGeo, attackTubeMat);
    scene.add(attackTube);

    // Pulse Particle traveling on attack curve
    const pulseGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    scene.add(pulseMesh);

    // 5. Trust Relationships (Cyan dashed splines)
    trustEdges.forEach((edge) => {
      const srcNode = enterpriseNodes.find((n) => n.id === edge.from);
      const tgtNode = enterpriseNodes.find((n) => n.id === edge.to);
      if (!srcNode || !tgtNode) return;

      const p1 = new THREE.Vector3(srcNode.pos3D[0], 0.8, srcNode.pos3D[2]);
      const p2 = new THREE.Vector3(tgtNode.pos3D[0], 0.8, tgtNode.pos3D[2]);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      mid.y += 1.5;

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(24);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: true,
        opacity: isDark ? 0.5 : 0.65,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      scene.add(line);
    });

    // Raycaster for Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // only left click
      controlsRef.current.isDragging = true;
      controlsRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (controlsRef.current.isDragging) {
        const dx = e.clientX - controlsRef.current.prevMouse.x;
        const dy = e.clientY - controlsRef.current.prevMouse.y;
        controlsRef.current.prevMouse = { x: e.clientX, y: e.clientY };

        controlsRef.current.spherical.theta -= dx * 0.007;
        controlsRef.current.spherical.phi = Math.max(
          0.2,
          Math.min(Math.PI / 2.1, controlsRef.current.spherical.phi - dy * 0.007)
        );
        updateCameraPos();
      } else {
        // Hover Raycast
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects, true);
        if (intersects.length > 0) {
          container.style.cursor = "pointer";
        } else {
          container.style.cursor = "grab";
        }
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      controlsRef.current.isDragging = false;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);
      if (intersects.length > 0) {
        let currentObj: any = intersects[0].object;
        while (currentObj && !currentObj.userData?.node) {
          currentObj = currentObj.parent;
        }
        if (currentObj?.userData?.node) {
          const node = currentObj.userData.node as EnterpriseNode;
          setActiveNode(node);
          if (onSelectAsset) onSelectAsset(node as any);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        controlsRef.current.spherical.radius = Math.max(
          15,
          Math.min(60, controlsRef.current.spherical.radius + e.deltaY * 0.04)
        );
        updateCameraPos();
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Auto Rotation
      if (isAutoRotating && !controlsRef.current.isDragging) {
        controlsRef.current.spherical.theta += delta * 0.08;
        updateCameraPos();
      }

      // Attack Pulse Particle Animation
      const pulseT = (time * 0.35) % 1;
      const pulsePos = attackCurve.getPointAt(pulseT);
      pulseMesh.position.copy(pulsePos);

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight > 50 ? container.clientHeight : 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 50 && h > 50) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [viewMode, isAutoRotating, isDark]);

  const handleZoomIn = () => {
    controlsRef.current.spherical.radius = Math.max(15, controlsRef.current.spherical.radius - 5);
    if (cameraRef.current) {
      const { radius, theta, phi } = controlsRef.current.spherical;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.position.set(x, y, z);
      cameraRef.current.lookAt(controlsRef.current.target);
    }
  };

  const handleZoomOut = () => {
    controlsRef.current.spherical.radius = Math.min(60, controlsRef.current.spherical.radius + 5);
    if (cameraRef.current) {
      const { radius, theta, phi } = controlsRef.current.spherical;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.position.set(x, y, z);
      cameraRef.current.lookAt(controlsRef.current.target);
    }
  };

  const handleResetCamera = () => {
    controlsRef.current.spherical = { radius: 36, theta: Math.PI / 4, phi: Math.PI / 3.4 };
    if (cameraRef.current) {
      const { radius, theta, phi } = controlsRef.current.spherical;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.position.set(x, y, z);
      cameraRef.current.lookAt(controlsRef.current.target);
    }
  };

  return (
    <div
      className={`relative w-full ${height} bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] overflow-hidden select-none group`}
    >
      {/* 1. VIEW MODE: 3D REAL THREE.JS ISOMETRIC SCENE */}
      {viewMode === "3D" && (
        <div className="relative w-full h-full">
          {/* WebGL Canvas Mount */}
          <div ref={canvasContainerRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

          {/* Floating 3D Node Labels Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { name: "External Internet", assets: "1 asset", x: "14%", y: "66%", color: "text-sky-400" },
              { name: "Office Network", assets: "12 assets", x: "28%", y: "24%", color: "text-sky-400" },
              { name: "Cloud (AWS)", assets: "28 assets", x: "55%", y: "16%", color: "text-sky-400" },
              { name: "Web Tier", assets: "8 assets", x: "42%", y: "44%", color: "text-amber-400" },
              { name: "Identity (AD)", assets: "6 assets", x: "27%", y: "76%", color: "text-sky-400" },
              { name: "App Tier", assets: "15 assets", x: "58%", y: "46%", color: "text-sky-400" },
              { name: "Database", assets: "4 assets", x: "82%", y: "30%", color: "text-red-400" },
              { name: "Critical Assets", assets: "3 assets", x: "66%", y: "74%", color: "text-red-400" },
            ].map((lbl, idx) => (
              <div
                key={idx}
                style={{ left: lbl.x, top: lbl.y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-[#07090D]/85 border border-[#1E2536] backdrop-blur-md shadow-lg text-center"
              >
                <div className={`text-[10px] font-bold ${lbl.color} leading-tight`}>{lbl.name}</div>
                <div className="text-[8px] text-slate-400 font-mono leading-none">{lbl.assets}</div>
              </div>
            ))}
          </div>

          {/* Left Zoom & View Controls (+, -, Reticle, Auto-Rotate) */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
            <button
              onClick={handleZoomIn}
              className="w-7 h-7 rounded-lg bg-[var(--bg-card)]/90 border border-[var(--border-main)] hover:border-orange-500/50 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all shadow-md backdrop-blur-md"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-7 h-7 rounded-lg bg-[var(--bg-card)]/90 border border-[var(--border-main)] hover:border-orange-500/50 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all shadow-md backdrop-blur-md"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetCamera}
              className="w-7 h-7 rounded-lg bg-[var(--bg-card)]/90 border border-[var(--border-main)] hover:border-orange-500/50 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all shadow-md backdrop-blur-md"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all shadow-md backdrop-blur-md ${
                isAutoRotating
                  ? "bg-[#211410] border-[#FF5722]/50 text-[#FF5722]"
                  : "bg-[var(--bg-card)]/90 border-[var(--border-main)] text-[var(--text-secondary)] hover:text-white"
              }`}
              title={isAutoRotating ? "Pause Auto-Rotation" : "Resume Auto-Rotation"}
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Bottom Left Mini-Map Box */}
          <div className="absolute bottom-4 left-4 w-32 h-20 rounded-xl bg-[var(--bg-card)]/90 border border-[var(--border-main)] p-2 shadow-xl backdrop-blur-md hidden sm:block pointer-events-none">
            <div className="text-[7.5px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
              TOPOLOGY RADAR
            </div>
            <div className="relative w-full h-11 border border-[var(--border-main)]/60 rounded bg-[var(--bg-input)]">
              {enterpriseNodes.map((n) => (
                <span
                  key={`mini-${n.id}`}
                  style={{
                    left: `${((n.pos3D[0] + 16) / 32) * 85 + 5}%`,
                    top: `${((n.pos3D[2] + 14) / 28) * 75 + 10}%`,
                  }}
                  className={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                    n.status === "compromised"
                      ? "bg-red-500 animate-ping"
                      : n.status === "at_risk"
                      ? "bg-amber-400"
                      : "bg-sky-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Right Legend (matching the photo's legend) */}
          <div className="absolute bottom-4 right-4 bg-[var(--bg-card)]/90 border border-[var(--border-main)] rounded-xl p-3 text-[9.5px] font-sans shadow-2xl backdrop-blur-md z-10 w-44">
            <div className="space-y-1.5 text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                <span className="text-[var(--text-primary)]">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9800]" />
                <span className="text-[var(--text-primary)]">At Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="text-[var(--text-primary)]">Compromised</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-main)]">
                <span className="w-4 h-0.5 bg-[#FF5722] rounded" />
                <span className="text-[var(--text-primary)]">Attack Path</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-[#38BDF8] rounded" />
                <span className="text-[var(--text-primary)]">Trust Relationship</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEW MODE: 2D CLEAN ENTERPRISE GRAPH FLOW (XM Cyber Style from Photo 3) */}
      {viewMode === "2D" && (
        <div className="relative w-full h-full canvas-grid flex flex-col justify-between p-4">
          {/* Top Remediable Exposures Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-primary)] bg-[var(--bg-card)]/95 px-3 py-1.5 rounded-lg border border-[var(--border-main)] z-10">
            <div className="flex items-center gap-4">
              <span className="text-[#FF5722] font-bold flex items-center gap-1">
                <span>&gt;&gt;&gt;</span>
                <span>Active Attack Chain:</span>
              </span>
              <span className="text-[var(--text-secondary)]">
                Internet &rarr; Web Tier (CVE-2023-46604) &rarr; App Tier &rarr; Critical Vault
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-red-950/70 text-red-400 border border-red-500/40 font-bold">
                12 Critical Paths
              </span>
            </div>
          </div>

          {/* SVG Graph Flow Canvas */}
          <div className="relative flex-1 w-full my-2">
            <svg className="w-full h-full" viewBox="0 0 850 360">
              {/* Trust Relationship Curves */}
              {trustEdges.map((e, idx) => {
                const src = enterpriseNodes.find((n) => n.id === e.from);
                const tgt = enterpriseNodes.find((n) => n.id === e.to);
                if (!src || !tgt) return null;
                const dx = tgt.x - src.x;
                const pathD = `M ${src.x} ${src.y} C ${src.x + dx * 0.5} ${src.y}, ${tgt.x - dx * 0.5} ${tgt.y}, ${tgt.x} ${tgt.y}`;
                return (
                  <path
                    key={`trust-${idx}`}
                    d={pathD}
                    fill="none"
                    stroke={isDark ? "rgba(56, 189, 248, 0.3)" : "rgba(2, 132, 199, 0.4)"}
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                );
              })}

              {/* Active Attack Path (smooth glowing red conduit) */}
              {attackPathEdges.map((e, idx) => {
                const src = enterpriseNodes.find((n) => n.id === e.from);
                const tgt = enterpriseNodes.find((n) => n.id === e.to);
                if (!src || !tgt) return null;
                const dx = tgt.x - src.x;
                const pathD = `M ${src.x} ${src.y} C ${src.x + dx * 0.5} ${src.y}, ${tgt.x - dx * 0.5} ${tgt.y}, ${tgt.x} ${tgt.y}`;
                return (
                  <g key={`attack-${idx}`}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="rgba(239, 68, 68, 0.25)"
                      strokeWidth="8"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2.5"
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {enterpriseNodes.map((node) => {
                const isSelected = activeNode?.id === node.id;
                const isCrit = node.status === "compromised";
                const isRisk = node.status === "at_risk";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => {
                      setActiveNode(node);
                      if (onSelectAsset) onSelectAsset(node as any);
                    }}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        r="24"
                        fill="none"
                        stroke="#FF5722"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                      />
                    )}

                    {node.id === "CRIT-VAULT-01" ? (
                      <polygon
                        points="0,-18 16,-9 16,9 0,18 -16,9 -16,-9"
                        fill={isDark ? "#7F1D1D" : "#FEE2E2"}
                        stroke="#EF4444"
                        strokeWidth="2"
                      />
                    ) : (
                      <circle
                        r="18"
                        fill={isCrit ? (isDark ? "#450A0A" : "#FEE2E2") : isRisk ? (isDark ? "#261505" : "#FEF3C7") : (isDark ? "#0C1322" : "#E0F2FE")}
                        stroke={isCrit ? "#EF4444" : isRisk ? "#F59E0B" : "#0284C7"}
                        strokeWidth="2"
                      />
                    )}

                    {/* Choke Point Severity Badge */}
                    <circle
                      cx="14"
                      cy="-12"
                      r="6"
                      fill={node.chokePointScore >= 80 ? "#DC2626" : "#0284C7"}
                    />
                    <text
                      x="14"
                      y="-10"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="6"
                      fontWeight="bold"
                    >
                      {node.chokePointScore}
                    </text>

                    {/* Label */}
                    <text
                      y="32"
                      textAnchor="middle"
                      fill={isDark ? "#FFFFFF" : "#0F172A"}
                      fontSize="10"
                      fontWeight="600"
                    >
                      {node.name}
                    </text>
                    <text
                      y="44"
                      textAnchor="middle"
                      fill={isDark ? "#8E98A8" : "#64748B"}
                      fontSize="8"
                    >
                      {node.zone} // {node.ip}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Inbound / Outbound Direction Pill */}
            <div className="absolute left-3 bottom-3 flex items-center bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-0.5 text-[10px] font-mono">
              <button
                onClick={() => setDirectionFilter("Inbound")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  directionFilter === "Inbound"
                    ? "bg-[#211410] text-[#FF5722] font-bold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Inbound
              </button>
              <button
                onClick={() => setDirectionFilter("Outbound")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  directionFilter === "Outbound"
                    ? "bg-[#211410] text-[#FF5722] font-bold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Outbound
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entity Properties Modal/Drawer on click */}
      {activeNode && (
        <div className="absolute left-3 top-3 w-72 rounded-xl bg-[var(--bg-card)]/95 border border-[var(--border-main)] shadow-2xl p-3.5 z-30 font-sans backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-main)]">
            <div>
              <div className="font-bold text-[var(--text-primary)] text-xs">{activeNode.name}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{activeNode.type}</div>
            </div>
            <button
              onClick={() => setActiveNode(null)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-base leading-none"
            >
              &times;
            </button>
          </div>

          <div className="mt-2.5 space-y-2 text-[10.5px]">
            <div className="grid grid-cols-2 gap-2 bg-[var(--bg-input)] p-2 rounded-lg border border-[var(--border-main)]">
              <div>
                <div className="text-[9px] text-[var(--text-muted)]">Choke point:</div>
                <div className="text-sm font-bold text-red-400 font-mono">
                  {activeNode.chokePointScore} / 100
                </div>
              </div>
              <div>
                <div className="text-[9px] text-[var(--text-muted)]">Compromise score:</div>
                <div className="text-sm font-bold text-orange-400 font-mono">
                  {activeNode.compromiseScore} / 100
                </div>
              </div>
            </div>

            <div className="space-y-1 font-mono text-[10px] text-[var(--text-secondary)]">
              <div>OS: <span className="text-[var(--text-primary)]">{activeNode.os}</span></div>
              <div>IP: <span className="text-[var(--text-primary)]">{activeNode.ip}</span></div>
              <div>Zone: <span className="text-[var(--text-primary)]">{activeNode.zone}</span></div>
              <div>Asset Count: <span className="text-[var(--text-primary)]">{activeNode.assetCount}</span></div>
            </div>

            {activeNode.cves.length > 0 && (
              <div className="pt-1">
                <div className="text-[9px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">
                  REMEDIABLE EXPOSURES
                </div>
                <div className="flex flex-wrap gap-1">
                  {activeNode.cves.map((cve, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-300 text-[9px] font-mono"
                    >
                      {cve}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Right View Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
        <div className="flex rounded-lg bg-[var(--bg-card)]/90 border border-[var(--border-main)] p-0.5 text-xs font-medium backdrop-blur-md shadow-md">
          <button
            onClick={() => setViewMode("3D")}
            className={`px-3 py-1 rounded-md transition-all text-xs font-medium ${
              viewMode === "3D"
                ? "bg-[#211410] text-[#FF5722] border border-[#FF5722]/40 font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => setViewMode("2D")}
            className={`px-3 py-1 rounded-md transition-all text-xs font-medium ${
              viewMode === "2D"
                ? "bg-[#211410] text-[#FF5722] border border-[#FF5722]/40 font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            2D View
          </button>
        </div>
      </div>
    </div>
  );
};
