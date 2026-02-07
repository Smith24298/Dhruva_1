import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const FloatingShape = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        mouseRef.current.y * 0.25,
        0.06
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        mouseRef.current.x * 0.25,
        0.06
      );
      meshRef.current.rotation.z += 0.0015;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.008;
    }
  });

  return (
    <group>
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh ref={meshRef} scale={2.2}>
          <dodecahedronGeometry args={[1, 0]} />
          <MeshDistortMaterial
            color="#3DC2EC"
            distort={0.25}
            speed={1.8}
            roughness={0.15}
            metalness={0.85}
            emissive="#0d3d56"
          />
        </mesh>
      </Float>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} scale={2.6}>
        <torusGeometry args={[1.15, 0.03, 16, 64]} />
        <meshStandardMaterial
          color="#4C3BCF"
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
};

const Particles = () => (
  <Stars
    radius={80}
    depth={40}
    count={2500}
    factor={3}
    saturation={0}
    fade
    speed={0.6}
  />
);

export const FloatingScene = () => {
  return (
    <div className="w-full h-full min-h-[320px] rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 70 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[10, 10, 5]} intensity={1.1} color="#3DC2EC" />
        <directionalLight position={[-8, -8, -4]} intensity={0.4} color="#4C3BCF" />
        <pointLight position={[0, 2, 2]} intensity={0.8} color="#ffffff" />

        <FloatingShape />
        <Particles />
      </Canvas>
    </div>
  );
};
