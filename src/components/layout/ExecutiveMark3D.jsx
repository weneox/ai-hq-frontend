import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ExecutiveMark3D({ className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth || 56;
    let height = mount.clientHeight || 56;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xf8fbff, 1.35);
    key.position.set(2.4, 2.1, 4.8);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xcfe6ff, 0.45);
    fill.position.set(-2.8, -1.2, 3.2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.3);
    rim.position.set(0, 3, 2.8);
    scene.add(rim);

    const mark = new THREE.Group();
    root.add(mark);

    const crystalGeometry = new THREE.OctahedronGeometry(1.04, 0);

    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf6f9fd,
      roughness: 0.22,
      metalness: 0.04,
      transmission: 0.08,
      transparent: true,
      opacity: 0.97,
      thickness: 0.55,
      ior: 1.16,
      reflectivity: 0.45,
      clearcoat: 0.9,
      clearcoatRoughness: 0.18,
    });

    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
    crystal.scale.set(0.82, 1.02, 0.82);
    crystal.rotation.z = 0.18;
    mark.add(crystal);

    const innerGeometry = new THREE.OctahedronGeometry(0.62, 0);
    const innerMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdbeeff,
      roughness: 0.34,
      metalness: 0.02,
      transmission: 0.02,
      transparent: true,
      opacity: 0.16,
      thickness: 0.3,
      ior: 1.08,
      clearcoat: 0.45,
      clearcoatRoughness: 0.28,
    });

    const inner = new THREE.Mesh(innerGeometry, innerMaterial);
    inner.scale.set(0.92, 1.04, 0.92);
    inner.rotation.z = -0.1;
    mark.add(inner);

    const edges = new THREE.EdgesGeometry(crystalGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
    });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    edgeLines.scale.copy(crystal.scale);
    edgeLines.rotation.copy(crystal.rotation);
    mark.add(edgeLines);

    const orbitGeometry = new THREE.TorusGeometry(1.46, 0.018, 12, 140);
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0xc7e7ff,
      transparent: true,
      opacity: 0.1,
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = 1.02;
    orbit.rotation.y = -0.3;
    orbit.rotation.z = 0.08;
    orbit.scale.set(1.02, 0.92, 1);
    mark.add(orbit);

    const arcGeometry = new THREE.TorusGeometry(
      1.16,
      0.014,
      10,
      100,
      Math.PI * 0.88
    );
    const arcMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.09,
    });
    const arc = new THREE.Mesh(arcGeometry, arcMaterial);
    arc.rotation.x = 0.92;
    arc.rotation.y = 0.48;
    arc.rotation.z = 1.22;
    mark.add(arc);

    let raf = 0;
    let disposed = false;

    const animate = () => {
      if (disposed) return;

      const t = performance.now() * 0.001;

      root.rotation.y = Math.sin(t * 0.3) * 0.06;
      root.rotation.x = Math.sin(t * 0.22) * 0.03;

      mark.rotation.y += 0.002;
      crystal.rotation.z = 0.18 + Math.sin(t * 0.55) * 0.014;
      inner.rotation.z = -0.1 - Math.sin(t * 0.45) * 0.01;

      orbit.rotation.z = 0.08 + t * 0.11;
      arc.rotation.z = 1.22 - t * 0.08;

      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = mount.clientWidth || 56;
      height = mount.clientHeight || 56;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
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
      innerGeometry.dispose();
      innerMaterial.dispose();
      edges.dispose();
      edgeMaterial.dispose();
      orbitGeometry.dispose();
      orbitMaterial.dispose();
      arcGeometry.dispose();
      arcMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className={className} />;
}