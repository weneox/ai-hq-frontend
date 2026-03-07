import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  RoundedBox,
  Torus,
  Sphere,
  Box,
  Cylinder,
  Ring,
} from "@react-three/drei";
import { easing } from "maath";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function SceneLights({ active }) {
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[2.6, 3.2, 2.4]} intensity={1.45} />
      <pointLight
        position={[-2.2, 1.6, 2.4]}
        intensity={active ? 2.2 : 1.15}
        color="#67e8f9"
      />
      <pointLight
        position={[2.1, -1.2, 2.2]}
        intensity={active ? 1.8 : 0.95}
        color="#6366f1"
      />
    </>
  );
}

function GlassShell({ active }) {
  return (
    <RoundedBox args={[1.64, 1.64, 0.34]} radius={0.28} smoothness={5}>
      <meshPhysicalMaterial
        color={active ? "#0d1835" : "#091126"}
        metalness={0.32}
        roughness={0.3}
        transmission={0.08}
        thickness={0.8}
        clearcoat={1}
        clearcoatRoughness={0.12}
        reflectivity={1}
        ior={1.2}
        emissive={active ? "#1d4ed8" : "#0f172a"}
        emissiveIntensity={active ? 0.18 : 0.07}
      />
    </RoundedBox>
  );
}

function Rim({ active, hovered }) {
  const ring = useRef();

  useFrame((state, delta) => {
    if (!ring.current) return;
    ring.current.rotation.z += delta * (active ? 0.45 : 0.18);
    ring.current.position.z = 0.2;
    ring.current.scale.x = THREE.MathUtils.lerp(
      ring.current.scale.x,
      hovered || active ? 1.03 : 1,
      0.12
    );
    ring.current.scale.y = ring.current.scale.x;
  });

  return (
    <group ref={ring}>
      <Torus args={[0.67, 0.04, 20, 80]}>
        <meshStandardMaterial
          color={active ? "#7dd3fc" : "#3b82f6"}
          emissive={active ? "#7dd3fc" : "#2563eb"}
          emissiveIntensity={active ? 2.4 : 1.05}
          roughness={0.26}
          metalness={0.72}
        />
      </Torus>
    </group>
  );
}

function CommandGlyph({ active }) {
  return (
    <group scale={0.9}>
      {[[-0.24, 0.24], [0.24, 0.24], [-0.24, -0.24], [0.24, -0.24]].map(
        ([x, y], i) => (
          <group key={i} position={[x, y, 0.18]}>
            <Cylinder args={[0.08, 0.08, 0.08, 28]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial
                color="#dbeafe"
                emissive={active ? "#93c5fd" : "#60a5fa"}
                emissiveIntensity={active ? 1.5 : 0.6}
                metalness={0.9}
                roughness={0.2}
              />
            </Cylinder>
            <Box args={[0.26, 0.06, 0.06]} position={[0, 0.14, 0]}>
              <meshStandardMaterial
                color="#dbeafe"
                emissive="#60a5fa"
                emissiveIntensity={active ? 1.15 : 0.45}
                metalness={0.9}
                roughness={0.2}
              />
            </Box>
            <Box args={[0.06, 0.26, 0.06]} position={[0.14, 0, 0]}>
              <meshStandardMaterial
                color="#dbeafe"
                emissive="#60a5fa"
                emissiveIntensity={active ? 1.15 : 0.45}
                metalness={0.9}
                roughness={0.2}
              />
            </Box>
          </group>
        )
      )}
    </group>
  );
}

function AnalyticsGlyph({ active }) {
  const bars = [0.32, 0.52, 0.74];
  return (
    <group position={[0, -0.06, 0.12]}>
      {bars.map((h, i) => (
        <RoundedBox
          key={i}
          args={[0.18, h, 0.16]}
          radius={0.05}
          smoothness={4}
          position={[-0.34 + i * 0.34, -0.22 + h / 2, 0]}
        >
          <meshStandardMaterial
            color={i === 2 ? "#e0f2fe" : "#c7d2fe"}
            emissive={i === 2 ? "#67e8f9" : "#60a5fa"}
            emissiveIntensity={active ? 1.8 : 0.7}
            metalness={0.78}
            roughness={0.2}
          />
        </RoundedBox>
      ))}
      <Torus args={[0.18, 0.024, 16, 36]} position={[0.38, 0.44, 0.02]}>
        <meshStandardMaterial
          color="#93c5fd"
          emissive="#67e8f9"
          emissiveIntensity={active ? 2 : 0.8}
          metalness={0.8}
          roughness={0.18}
        />
      </Torus>
    </group>
  );
}

function BriefcaseGlyph({ active }) {
  return (
    <group position={[0, -0.02, 0.12]}>
      <RoundedBox args={[0.92, 0.58, 0.22]} radius={0.12} smoothness={4}>
        <meshStandardMaterial
          color="#dbeafe"
          emissive="#60a5fa"
          emissiveIntensity={active ? 1.05 : 0.34}
          metalness={0.82}
          roughness={0.2}
        />
      </RoundedBox>
      <RoundedBox args={[0.28, 0.12, 0.12]} radius={0.05} smoothness={4} position={[0, 0.36, 0.02]}>
        <meshStandardMaterial
          color="#bfdbfe"
          emissive="#93c5fd"
          emissiveIntensity={active ? 1.2 : 0.4}
          metalness={0.82}
          roughness={0.18}
        />
      </RoundedBox>
      <Box args={[0.92, 0.04, 0.04]} position={[0, 0.02, 0.13]}>
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={active ? 1.8 : 0.7}
          metalness={0.85}
          roughness={0.15}
        />
      </Box>
    </group>
  );
}

function OrbitGlyph({ active }) {
  const group = useRef();

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * (active ? 0.8 : 0.35);
  });

  return (
    <group ref={group} position={[0, 0, 0.12]}>
      <Sphere args={[0.12, 24, 24]}>
        <meshStandardMaterial
          color="#dbeafe"
          emissive="#93c5fd"
          emissiveIntensity={active ? 1.7 : 0.7}
          metalness={0.86}
          roughness={0.18}
        />
      </Sphere>

      <Torus args={[0.38, 0.026, 20, 60]}>
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={active ? 1.7 : 0.7}
          metalness={0.8}
          roughness={0.18}
        />
      </Torus>

      <Torus args={[0.55, 0.022, 20, 60]} rotation={[1.1, 0.4, 0.3]}>
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={active ? 1.6 : 0.58}
          metalness={0.82}
          roughness={0.18}
        />
      </Torus>

      <Sphere args={[0.05, 20, 20]} position={[0.55, 0, 0]}>
        <meshStandardMaterial
          color="#ecfeff"
          emissive="#67e8f9"
          emissiveIntensity={active ? 2.2 : 0.9}
          metalness={0.82}
          roughness={0.16}
        />
      </Sphere>
    </group>
  );
}

function AgentsGlyph({ active }) {
  return (
    <group position={[0, -0.02, 0.14]}>
      <Sphere args={[0.16, 24, 24]} position={[0, 0.18, 0]}>
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#93c5fd"
          emissiveIntensity={active ? 1.7 : 0.7}
          metalness={0.85}
          roughness={0.16}
        />
      </Sphere>

      <RoundedBox args={[0.6, 0.34, 0.18]} radius={0.12} smoothness={4} position={[0, -0.18, 0]}>
        <meshStandardMaterial
          color="#c7d2fe"
          emissive="#60a5fa"
          emissiveIntensity={active ? 1.15 : 0.45}
          metalness={0.82}
          roughness={0.18}
        />
      </RoundedBox>

      <Sphere args={[0.04, 16, 16]} position={[-0.16, 0.16, 0.18]}>
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={active ? 2.2 : 0.8}
        />
      </Sphere>
      <Sphere args={[0.04, 16, 16]} position={[0.16, 0.16, 0.18]}>
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={active ? 2.2 : 0.8}
        />
      </Sphere>
    </group>
  );
}

function ThreadsGlyph({ active }) {
  return (
    <group position={[0, 0, 0.12]}>
      <Ring args={[0.22, 0.32, 40]} position={[0, 0, 0.04]}>
        <meshStandardMaterial
          color="#dbeafe"
          emissive="#93c5fd"
          emissiveIntensity={active ? 1.45 : 0.55}
          metalness={0.86}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </Ring>

      <Torus args={[0.5, 0.03, 16, 80]} rotation={[0.72, 0.2, 0.4]}>
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={active ? 1.8 : 0.7}
          metalness={0.84}
          roughness={0.18}
        />
      </Torus>

      <Sphere args={[0.06, 20, 20]} position={[0.38, 0.24, 0.06]}>
        <meshStandardMaterial
          color="#ecfeff"
          emissive="#67e8f9"
          emissiveIntensity={active ? 2 : 0.9}
        />
      </Sphere>
    </group>
  );
}

function SettingsGlyph({ active }) {
  return (
    <group position={[0, 0, 0.12]}>
      {[-0.22, 0, 0.22].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <Box args={[0.82, 0.04, 0.04]}>
            <meshStandardMaterial
              color="#bfdbfe"
              emissive="#60a5fa"
              emissiveIntensity={active ? 1.05 : 0.35}
              metalness={0.84}
              roughness={0.16}
            />
          </Box>
          <Sphere
            args={[0.085, 22, 22]}
            position={[
              i === 0 ? -0.16 : i === 1 ? 0.18 : -0.02,
              0,
              0.03,
            ]}
          >
            <meshStandardMaterial
              color="#ecfeff"
              emissive="#67e8f9"
              emissiveIntensity={active ? 2 : 0.85}
              metalness={0.85}
              roughness={0.14}
            />
          </Sphere>
        </group>
      ))}
    </group>
  );
}

function ShieldGlyph({ active }) {
  return (
    <group position={[0, 0.02, 0.12]}>
      <Cylinder args={[0.02, 0.02, 0.001, 3]} visible={false} />
      <mesh position={[0, 0, 0]}>
        <shapeGeometry
          args={[
            useMemo(() => {
              const shape = new THREE.Shape();
              shape.moveTo(0, 0.46);
              shape.quadraticCurveTo(0.35, 0.38, 0.34, 0.06);
              shape.quadraticCurveTo(0.32, -0.34, 0, -0.56);
              shape.quadraticCurveTo(-0.32, -0.34, -0.34, 0.06);
              shape.quadraticCurveTo(-0.35, 0.38, 0, 0.46);
              return shape;
            }, []),
          ]}
        />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#60a5fa"
          emissiveIntensity={active ? 1.3 : 0.48}
          metalness={0.84}
          roughness={0.2}
        />
      </mesh>

      <Box args={[0.08, 0.26, 0.08]} position={[0, -0.02, 0.06]}>
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={active ? 2.2 : 0.8}
          metalness={0.85}
          roughness={0.16}
        />
      </Box>
      <Box args={[0.2, 0.08, 0.08]} position={[0, -0.1, 0.06]}>
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={active ? 2.2 : 0.8}
          metalness={0.85}
          roughness={0.16}
        />
      </Box>
    </group>
  );
}

function BrandGlyph({ active }) {
  const group = useRef();

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * (active ? 0.9 : 0.38);
    group.current.rotation.x += delta * 0.16;
  });

  return (
    <group ref={group} position={[0, 0, 0.12]}>
      <Torus args={[0.34, 0.03, 20, 70]} rotation={[0.8, 0.2, 0.4]}>
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={active ? 1.8 : 0.72}
          metalness={0.86}
          roughness={0.18}
        />
      </Torus>
      <Torus args={[0.34, 0.03, 20, 70]} rotation={[-0.8, -0.4, -0.3]}>
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={active ? 1.55 : 0.62}
          metalness={0.86}
          roughness={0.18}
        />
      </Torus>
      <Sphere args={[0.12, 24, 24]}>
        <meshStandardMaterial
          color="#eff6ff"
          emissive="#93c5fd"
          emissiveIntensity={active ? 1.85 : 0.8}
          metalness={0.86}
          roughness={0.14}
        />
      </Sphere>
    </group>
  );
}

function Glyph({ type, active }) {
  switch (type) {
    case "brand":
      return <BrandGlyph active={active} />;
    case "command":
      return <CommandGlyph active={active} />;
    case "analytics":
      return <AnalyticsGlyph active={active} />;
    case "proposals":
      return <BriefcaseGlyph active={active} />;
    case "executions":
      return <OrbitGlyph active={active} />;
    case "agents":
      return <AgentsGlyph active={active} />;
    case "threads":
      return <ThreadsGlyph active={active} />;
    case "settings":
      return <SettingsGlyph active={active} />;
    case "security":
      return <ShieldGlyph active={active} />;
    default:
      return <CommandGlyph active={active} />;
  }
}

function IconModel({ type, active, hovered }) {
  const group = useRef();

  useFrame((state, delta) => {
    if (!group.current) return;

    const targetRotY = hovered ? 0.24 : active ? 0.14 : 0.06;
    const targetRotX = hovered ? -0.18 : active ? -0.1 : -0.04;
    const targetPosY = hovered ? 0.03 : active ? 0.015 : 0;
    const targetScale = hovered ? 1.05 : active ? 1.025 : 1;

    easing.dampE(group.current.rotation, "y", targetRotY, 0.22, delta);
    easing.dampE(group.current.rotation, "x", targetRotX, 0.22, delta);
    easing.damp3(group.current.position, [0, targetPosY, 0], 0.22, delta);
    easing.damp3(
      group.current.scale,
      [targetScale, targetScale, targetScale],
      0.22,
      delta
    );
  });

  return (
    <Float
      speed={active ? 1.4 : 1}
      rotationIntensity={0.14}
      floatIntensity={active ? 0.18 : 0.1}
    >
      <group ref={group}>
        <GlassShell active={active} />
        <Rim active={active} hovered={hovered} />
        <Glyph type={type} active={active} />
      </group>
    </Float>
  );
}

export default function Sidebar3DIcon({
  type = "command",
  active = false,
  hovered = false,
  className = "",
}) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3.3], fov: 34 }}
      >
        <SceneLights active={active} />
        <IconModel type={type} active={active} hovered={hovered} />
      </Canvas>
    </div>
  );
}