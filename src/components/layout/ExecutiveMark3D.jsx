import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ExecutiveMark3D({ className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 40;
    const height = mount.clientHeight || 40;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const ambient = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambient);

    const key = new THREE.PointLight(0xa5c8ff, 2.4, 20);
    key.position.set(2.2, 2.4, 5);
    scene.add(key);

    const fill = new THREE.PointLight(0x7cf7ff, 1.25, 20);
    fill.position.set(-3, -1.5, 4);
    scene.add(fill);

    const rim = new THREE.PointLight(0xffffff, 1.15, 20);
    rim.position.set(0, 3.2, 3);
    scene.add(rim);

    const crystalGeometry = new THREE.OctahedronGeometry(1.02, 0);
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf6fbff,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.12,
      roughness: 0.1,
      metalness: 0.12,
      transmission: 0.18,
      transparent: true,
      opacity: 0.96,
      ior: 1.25,
      thickness: 0.7,
      reflectivity: 0.7,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
    crystal.scale.set(0.72, 0.9, 0.72);
    group.add(crystal);

    const edges = new THREE.EdgesGeometry(crystalGeometry);
    const edgeLines = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.72,
      })
    );
    edgeLines.scale.copy(crystal.scale);
    group.add(edgeLines);

    const ringGeometry = new THREE.TorusGeometry(1.42, 0.06, 16, 120);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x4cc9ff,
      transparent: true,
      opacity: 0.42,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = 0.95;
    ring.rotation.y = 0.18;
    group.add(ring);

    const haloGeometry = new THREE.TorusGeometry(1.6, 0.025, 12, 120);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.x = 1.08;
    halo.rotation.y = -0.15;
    group.add(halo);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 22;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i += 1) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.55 + Math.sin(i * 1.7) * 0.08;
      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.72;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xbefcff,
      size: 0.045,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.rotation.x = 0.3;
    group.add(particles);

    let raf = 0;
    let disposed = false;

    const animate = () => {
      if (disposed) return;

      const t = performance.now() * 0.001;

      group.rotation.y = t * 0.55;
      group.rotation.x = Math.sin(t * 0.9) * 0.08;

      crystal.rotation.y = -t * 0.7;
      crystal.rotation.z = Math.sin(t * 1.4) * 0.05;

      edgeLines.rotation.y = crystal.rotation.y;
      edgeLines.rotation.z = crystal.rotation.z;

      ring.rotation.z = t * 0.22;
      halo.rotation.z = -t * 0.18;
      particles.rotation.z = -t * 0.26;

      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const nextWidth = mount.clientWidth || 40;
      const nextHeight = mount.clientHeight || 40;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      resizeObserver.disconnect();

      crystalGeometry.dispose();
      crystalMaterial.dispose();
      edges.dispose();
      edgeLines.material.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className={className} />;
}