"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function SwampWater() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      const positions = geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const y = Math.sin(x * 0.5 + clock.elapsedTime * 0.5) * 0.1 +
                  Math.sin(z * 0.3 + clock.elapsedTime * 0.3) * 0.1;
        positions.setY(i, y);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
      <planeGeometry args={[80, 80, 40, 40]} />
      <meshStandardMaterial 
        color="#1a2f1a"
        roughness={0.3}
        metalness={0.1}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function SwampGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#0d1a0d" roughness={1} />
    </mesh>
  );
}

function SwampTree({ position }: { position: [number, number, number] }) {
  const height = 3 + Math.random() * 4;
  
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.2, 0.4, height, 8]} />
        <meshStandardMaterial color="#2d1f1a" roughness={0.9} />
      </mesh>
      {/* Hanging moss/vines */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.sin(i * 2) * 0.3, height - 0.5 - i * 0.5, Math.cos(i * 2) * 0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 1 + Math.random(), 4]} />
          <meshStandardMaterial color="#2a3a2a" roughness={1} />
        </mesh>
      ))}
      {/* Foliage */}
      <mesh position={[0, height + 0.5, 0]}>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshStandardMaterial color="#1a3a1a" roughness={0.8} />
      </mesh>
    </group>
  );
}

function SwampRock({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <mesh position={position} scale={scale}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>
  );
}

function Fog() {
  const fogRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (fogRef.current) {
      fogRef.current.rotation.y = clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={fogRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={500}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#3a4a3a" 
        size={0.5} 
        transparent 
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

export function SwampEnvironment() {
  const trees = useMemo(() => {
    const treePositions: [number, number, number][] = [];
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;
      // Avoid center spawn area
      if (Math.abs(x) > 5 || Math.abs(z) > 5) {
        treePositions.push([x, 0, z]);
      }
    }
    return treePositions;
  }, []);

  const rocks = useMemo(() => {
    const rockData: { position: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < 25; i++) {
      rockData.push({
        position: [
          (Math.random() - 0.5) * 50,
          -0.3 + Math.random() * 0.3,
          (Math.random() - 0.5) * 50
        ],
        scale: 0.3 + Math.random() * 0.5
      });
    }
    return rockData;
  }, []);

  return (
    <>
      <SwampGround />
      <SwampWater />
      <Fog />
      {trees.map((pos, i) => (
        <SwampTree key={`tree-${i}`} position={pos} />
      ))}
      {rocks.map((rock, i) => (
        <SwampRock key={`rock-${i}`} position={rock.position} scale={rock.scale} />
      ))}
    </>
  );
}
