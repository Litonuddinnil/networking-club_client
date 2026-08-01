import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface NetworkGlobe3DProps {
  className?: string;
}

export default function NetworkGlobe3D({ className = "" }: NetworkGlobe3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // -------- SETUP --------
    const scene = new THREE.Scene();
    const width = Math.max(1, container.clientWidth || window.innerWidth);
    const height = Math.max(1, container.clientHeight || window.innerHeight);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // -------- GLOBE (wireframe sphere with dotted surface) --------
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const sphereGeometry = new THREE.SphereGeometry(2.2, 48, 48);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x051022,
      transparent: true,
      opacity: 0.95,
    });
    const innerSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(innerSphere);

    // Dotted wireframe overlay
    const wireGeometry = new THREE.SphereGeometry(2.21, 32, 32);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b00,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireSphere = new THREE.Mesh(wireGeometry, wireMaterial);
    globeGroup.add(wireSphere);

    // -------- LATITUDE / LONGITUDE GRID RINGS --------
    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0xff6b00,
      transparent: true,
      opacity: 0.45,
    });

    // Latitude rings
    for (let i = 1; i < 6; i++) {
      const lat = (Math.PI / 6) * i;
      const r = 2.2 * Math.cos(lat);
      const y = 2.2 * Math.sin(lat);
      const ringGeo = new THREE.BufferGeometry();
      const points: number[] = [];
      for (let j = 0; j <= 64; j++) {
        const theta = (j / 64) * Math.PI * 2;
        points.push(r * Math.cos(theta), y, r * Math.sin(theta));
      }
      ringGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(points, 3)
      );
      const ring = new THREE.Line(ringGeo, ringMaterial);
      globeGroup.add(ring);
    }

    // Longitude rings
    for (let i = 0; i < 8; i++) {
      const phi = (Math.PI / 8) * i;
      const points: number[] = [];
      for (let j = 0; j <= 64; j++) {
        const theta = (j / 64) * Math.PI * 2;
        points.push(
          2.2 * Math.sin(theta) * Math.cos(phi),
          2.2 * Math.cos(theta),
          2.2 * Math.sin(theta) * Math.sin(phi)
        );
      }
      const ringGeo = new THREE.BufferGeometry();
      ringGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(points, 3)
      );
      const ring = new THREE.Line(ringGeo, ringMaterial);
      globeGroup.add(ring);
    }

    // -------- NETWORK NODES ON SURFACE --------
    const nodeCount = 60;
    const nodes: { mesh: THREE.Mesh; position: THREE.Vector3 }[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xff8c1a });

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 2.22;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(x, y, z);
      globeGroup.add(mesh);
      nodes.push({ mesh, position: new THREE.Vector3(x, y, z) });
    }

    // -------- CONNECTION ARCS BETWEEN NODES --------
    const arcMaterial = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.55,
    });

    interface Arc {
      line: THREE.Line;
      start: THREE.Vector3;
      end: THREE.Vector3;
      progress: number;
      speed: number;
    }
    const arcs: Arc[] = [];

    for (let i = 0; i < 30; i++) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a === b) continue;

      const arcPoints: number[] = [];
      const segments = 32;
      const dist = a.position.distanceTo(b.position);
      const mid = a.position.clone().add(b.position).multiplyScalar(0.5);
      const lift = Math.min(0.6, dist * 0.25);
      mid.normalize().multiplyScalar(2.22 + lift);

      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const pos = new THREE.Vector3()
          .copy(a.position)
          .lerp(b.position, t)
          .lerp(mid, Math.sin(Math.PI * t));
        arcPoints.push(pos.x, pos.y, pos.z);
      }

      const arcGeo = new THREE.BufferGeometry();
      arcGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(arcPoints, 3)
      );
      const line = new THREE.Line(arcGeo, arcMaterial);
      globeGroup.add(line);
      arcs.push({
        line,
        start: a.position,
        end: b.position,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.01,
      });
    }

    // -------- ORBITING SATELLITES (outer ring) --------
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0xff6b00,
      transparent: true,
      opacity: 0.25,
    });
    for (let i = 0; i < 3; i++) {
      const orbitPoints: number[] = [];
      const orbitRadius = 3.2 + i * 0.5;
      for (let j = 0; j <= 96; j++) {
        const theta = (j / 96) * Math.PI * 2;
        orbitPoints.push(
          orbitRadius * Math.cos(theta),
          0,
          orbitRadius * Math.sin(theta)
        );
      }
      const orbitGeo = new THREE.BufferGeometry();
      orbitGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(orbitPoints, 3)
      );
      const orbit = new THREE.Line(orbitGeo, orbitMaterial);
      orbit.rotation.x = Math.PI / 2 + i * 0.3;
      orbit.rotation.z = i * 0.5;
      orbitGroup.add(orbit);
    }

    // Satellite dots
    const satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
    const satellites: { mesh: THREE.Mesh; radius: number; angle: number; speed: number; tilt: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        satelliteMaterial
      );
      orbitGroup.add(sat);
      satellites.push({
        mesh: sat,
        radius: 3.2 + (i % 3) * 0.5,
        angle: (i / 12) * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.005,
        tilt: i * 0.3,
      });
    }

    // -------- PARTICLE STARS BACKGROUND --------
    const starGeometry = new THREE.BufferGeometry();
    const starPositions: number[] = [];
    for (let i = 0; i < 300; i++) {
      starPositions.push(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50 - 20
      );
    }
    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3)
    );
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // -------- LIGHT GLOW (subtle) --------
    const glowGeometry = new THREE.SphereGeometry(2.6, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b00,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    globeGroup.add(glow);

    // -------- MOUSE INTERACTION --------
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRotY = mouseX * 0.3;
      targetRotX = mouseY * 0.3;
    };

    container.addEventListener("mousemove", onMouseMove);

    // -------- RESIZE --------
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    // -------- ANIMATION LOOP --------
    let animationId: number;
    let autoRot = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      autoRot += 0.0025;
      globeGroup.rotation.y += 0.003;
      orbitGroup.rotation.y += 0.001;

      // Smooth easing toward mouse target
      globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.05;
      globeGroup.rotation.y += (targetRotY + autoRot - globeGroup.rotation.y) * 0.05;

      // Satellite orbit
      satellites.forEach((sat) => {
        sat.angle += sat.speed;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.z = Math.sin(sat.angle) * sat.radius;
        sat.mesh.position.y = Math.sin(sat.angle * 2) * 0.5;
      });

      // Arcs pulse effect (animate opacity)
      arcs.forEach((arc) => {
        arc.progress += arc.speed;
        const opacity = 0.2 + Math.sin(arc.progress) * 0.4;
        (arc.line.material as THREE.LineBasicMaterial).opacity = opacity;
      });

      // Stars subtle rotation
      stars.rotation.y += 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    // -------- CLEANUP --------
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      arcMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full cursor-grab active:cursor-grabbing ${className}`}
      style={{ minHeight: "320px" }}
    />
  );
}
