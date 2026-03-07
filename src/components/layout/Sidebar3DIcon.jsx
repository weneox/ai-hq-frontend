import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Line, Torus, Sphere } from "@react-three/drei";
import { easing } from "maath";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Lights({ active }) {
  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[2, 2, 3]} intensity={1.4} />
      <pointLight position={[-2, 1.5, 2]} intensity={active ? 2 : 1.1} color="#67e8f9" />
      <pointLight position={[2, -1, 2]} intensity={active ? 1.6 : 0.8} color="#818cf8" />
    </>
  );
}

function Token({ active }) {
  return (
    <>
      <RoundedBox args={[1.7, 1.7, 0.18]} radius={0.34} smoothness={5}>
        <meshPhysicalMaterial
          color={active ? "#0a1326" : "#09111f"}
          metalness={0.55}
          roughness={0.24}
          clearcoat={1}
          clearcoatRoughness={0.14}
          reflectivity={1}
          emissive={active ? "#0f3b72" : "#0a1630"}
          emissiveIntensity={active ? 0.45 : 0.16}
        />
      </RoundedBox>

      <Torus args={[0.78, 0.028, 20, 80]} position={[0, 0, 0.07]}>
        <meshStandardMaterial
          color={active ? "#7dd3fc" : "#3b82f6"}
          emissive={active ? "#7dd3fc" : "#2563eb"}
          emissiveIntensity={active ? 1.9 : 0.55}
          metalness={0.9}
          roughness={0.2}
        />
      </Torus>
    </>
  );
}

function CommandGlyph({ active }) {
  const color = active ? "#e6f6ff" : "#d7eafe";
  const glow = active ? "#67e8f9" : "#60a5fa";

  return (
    <group position={[0, 0, 0.16]} scale={0.92}>
      {[
        [-0.24, 0.24],
        [0.24, 0.24],
        [-0.24, -0.24],
        [0.24, -0.24],
      ].map(([x, y], i) => (
        <group key={i} position={[x, y, 0]}>
          <Sphere args={[0.07, 20, 20]}>
            <meshStandardMaterial
              color={color}
              emissive={glow}
              emissiveIntensity={active ? 1.45 : 0.5}
              metalness={0.92}
              roughness={0.16}
            />
          </Sphere>
          <Line
            points={[
              [-0.13, 0, 0],
              [0.13, 0, 0],
            ]}
            color={color}
            lineWidth={1.4}
          />
          <Line
            points={[
              [0, -0.13, 0],
              [0, 0.13, 0],
            ]}
            color={color}
            lineWidth={1.4}
          />
        </group>
      ))}
    </group>
  );
}

function AnalyticsGlyph({ active }) {
  const bars = useMemo(
    () => [
      { x: -0.28, h: 0.34 },
      { x: 0, h: 0.56 },
      { x: 0.28, h: 0.78 },
    ],
    []
  );

  return (
    <group position={[0, -0.08, 0.16]}>
      {bars.map((bar, i) => (
        <RoundedBox
          key={i}
          args={[0.15, bar.h, 0.12]}
          radius={0.05}
          smoothness={4}
          position={[bar.x, -0.26 + bar.h / 2, 0]}
        >
          <meshStandardMaterial
            color="#e6f6ff"
            emissive={i === 2 ? "#67e8f9" : "#60a5fa"}
            emissiveIntensity={active ? 1.55 : 0.6}
            metalness={0.9}
            roughness={0.15}
          />
        </RoundedBox>
      ))}
    </group>
  );
}

function ProposalsGlyph({ active }) {
  return (
    <group position={[0, 0, 0.16]}>
      <RoundedBox args={[0.92, 0.56, 0.12]} radius={0.12} smoothness={4}>
        <meshStandardMaterial
          color="#ebf7ff"
          emissive="#60a5fa"
          emissiveIntensity={active ? 1.1 : 0.38}
          metalness={0.92}
          roughness={0.16}
        />
      </RoundedBox>
      <Line points={[[-0.46, 0.08, 0.07], [0.46, 0.08, 0.07]]} color="#67e8f9" lineWidth={1.2} />
      <RoundedBox args={[0.24, 0.1, 0.08]} radius={0.04} smoothness={4} position={[0, 0.34, 0]}>
        <meshStandardMaterial
          color="#dbeeff"
          emissive="#93c5fd"
          emissiveIntensity={active ? 1.2 : 0.4}
          metalness={0.92}
          roughness={0.14}
        />
      </RoundedBox>
    </group>
  );
}

function ExecutionsGlyph({ active }) {
  const orbit = useRef();

  useFrame((_, delta) => {
    if (orbit.current) orbit.current.rotation.z += delta * (active ? 0.9 : 0.35);
  });

  return (
    <group position={[0, 0, 0.16]}>
      <Sphere args={[0.12, 20, 20]}>
        <meshStandardMaterial
          color="#eff8ff"
          emissive="#93c5fd"
          emissiveIntensity={active ? 1.35 : 0.5}
          metalness={0.92}
          roughness={0.16}
        />
      </Sphere>
      <group ref={orbit}>
        <Torus args={[0.38, 0.02, 16, 60]}>
          <meshStandardMaterial
            color="#67e8f9"
            emissive="#67e8f9"
            emissiveIntensity={active ? 1.5 : 0.55}
            metalness={0.9}
            roughness={0.15}
          />
        </Torus>
        <Sphere args={[0.05, 20, 20]} position={[0.38, 0, 0]}>
          <meshStandardMaterial
            color="#effcff"
            emissive="#67e8f9"
            emissiveIntensity={active ? 1.8 : 0.65}
          />
        </Sphere>
      </group>
    </group>
  );
}

function AgentsGlyph({ active }) {
  return (
    <group position={[0, 0, 0.16]}>
      <Sphere args={[0.14, 20, 20]} position={[0, 0.2, 0]}>
        <meshStandardMaterial
          color="#eff8ff"
          emissive="#93c5fd"
          emissiveIntensity={active ? 1.3 : 0.45}
          metalness={0.9}
          roughness={0.16}
        />
      </Sphere>
      <RoundedBox args={[0.58, 0.28, 0.12]} radius={0.12} smoothness={4} position={[0, -0.18, 0]}>
        <meshStandardMaterial
          color="#e6f4ff"
          emissive="#60a5fa"
          emissiveIntensity={active ? 1.05 : 0.35}
          metalness={0.9}
          roughness={0.15}
        />
      </RoundedBox>
      <Sphere args={[0.038, 16, 16]} position={[-0.14, 0.18, 0.08]}>
        <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={active ? 1.8 : 0.7} />
      </Sphere>
      <Sphere args={[0.038, 16, 16]} position={[0.14, 0.18, 0.08]}>
        <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={active ? 1.8 : 0.7} />
      </Sphere>
    </group>
  );
}

function ThreadsGlyph({ active }) {
  return (
    <group position={[0, 0, 0.16]}>
      <Torus args={[0.28, 0.018, 16, 50]} rotation={[0.7, 0.2, 0.3]}>
        <meshStandardMaterial
          color="#eaf7ff"
          emissive="#93c5fd"
          emissiveIntensity={active ? 1.2 : 0.4}
          metalness={0.92}
          roughness={0.15}
        />
      </Torus>
      <Torus args={[0.5, 0.018, 16, 60]} rotation={[0.9, -0.3, 0.4]}>
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={active ? 1.55 : 0.55}
          metalness={0.92}
          roughness={0.15}
        />
      </Torus>
      <Sphere args={[0.05, 20, 20]} position={[0.34, 0.22, 0.06]}>
        <meshStandardMaterial color="#effcff" emissive="#67e8f9" emissiveIntensity={active ? 1.8 : 0.7} />
      </Sphere>
    </group>
  );
}

function SettingsGlyph({ active }) {
  return (
    <group position={[0, 0, 0.16]}>
      {[-0.2, 0, 0.2].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <Line points={[[-0.42, 0, 0], [0.42, 0, 0]]} color="#dbeeff" lineWidth={1.3} />
          <Sphere
            args={[0.07, 20, 20]}
            position={[i === 0 ? -0.14 : i === 1 ? 0.18 : -0.02, 0, 0.02]}
          >
            <meshStandardMaterial
              color="#effcff"
              emissive="#67e8f9"
              emissiveIntensity={active ? 1.7 : 0.6}
              metalness={0.9}
              roughness={0.14}
            />
          </Sphere>
        </group>
      ))}
    </group>
  );
}

function SecurityGlyph({ active }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.42);
    s.quadraticCurveTo(0.3, 0.34, 0.3, 0.06);
    s.quadraticCurveTo(0.28, -0.28, 0, -0.5);
    s.quadraticCurveTo(-0.28, -0.28, -0.3, 0.06);
    s.quadraticCurveTo(-0.3, 0.34, 0, 0.42);
    return s;
  }, []);

  return (
    <group position={[0, 0, 0.16]}>
      <mesh>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color="#eaf7ff"
          emissive="#60a5fa"
          emissiveIntensity={active ? 1.2 : 0.4}
          metalness={0.92}
          roughness={0.16}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Line points={[[-0.1, -0.04, 0.04], [0, 0.08, 0.04], [0.15, -0.12, 0.04]]} color="#67e8f9" lineWidth={1.6} />
    </group>
  );
}

function BrandGlyph({ active }) {
  const group = useRef();

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * (active ? 0.7 : 0.22);
  });

  return (
    <group ref={group} position={[0, 0, 0.16]}>
      <Torus args={[0.34, 0.026, 16, 60]} rotation={[0.8, 0.2, 0.3]}>
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={active ? 1.55 : 0.6}
          metalness={0.92}
          roughness={0.15}
        />
      </Torus>
      <Torus args={[0.34, 0.026, 16, 60]} rotation={[-0.8, -0.3, -0.4]}>
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={active ? 1.25 : 0.5}
          metalness={0.92}
          roughness={0.15}
        />
      </Torus>
      <Sphere args={[0.09, 20, 20]}>
        <meshStandardMaterial
          color="#effcff"
          emissive="#93c5fd"
          emissiveIntensity={active ? 1.5 : 0.6}
          metalness={0.92}
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
      return <ProposalsGlyph active={active} />;
    case "executions":
      return <ExecutionsGlyph active={active} />;
    case "agents":
      return <AgentsGlyph active={active} />;
    case "threads":
      return <ThreadsGlyph active={active} />;
    case "settings":
      return <SettingsGlyph active={active} />;
    case "security":
      return <SecurityGlyph active={active} />;
    default:
      return <CommandGlyph active={active} />;
  }
}

function Model({ type, active, hovered }) {
  const group = useRef();

  useFrame((_, delta) => {
    if (!group.current) return;

    easing.dampE(
      group.current.rotation,
      "x",
      hovered ? -0.1 : active ? -0.05 : -0.02,
      0.22,
      delta
    );
    easing.dampE(
      group.current.rotation,
      "y",
      hovered ? 0.16 : active ? 0.08 : 0.02,
      0.22,
      delta
    );
    easing.damp3(
      group.current.position,
      [0, hovered ? 0.03 : active ? 0.01 : 0, 0],
      0.22,
      delta
    );
    easing.damp3(
      group.current.scale,
      hovered ? [1.04, 1.04, 1.04] : active ? [1.02, 1.02, 1.02] : [1, 1, 1],
      0.22,
      delta
    );
  });

  return (
    <group ref={group}>
      <Token active={active} />
      <Glyph type={type} active={active} />
    </group>
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
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3.2], fov: 30 }}
      >
        <Lights active={active} />
        <Model type={type} active={active} hovered={hovered} />
      </Canvas>
    </div>
  );
}