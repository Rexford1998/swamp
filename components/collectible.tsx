"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/lib/game-store";

const COLLECT_DISTANCE = 2;

interface CollectibleProps {
  position: THREE.Vector3;
  index: number;
}

export function Collectible({ position, index }: CollectibleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const { playerPosition, collectItem, gameOver, gameWon } = useGameStore();

  useFrame(({ clock }) => {
    if (!meshRef.current || gameOver || gameWon) return;

    // Floating animation
    meshRef.current.position.y = position.y + Math.sin(clock.elapsedTime * 2 + index) * 0.3;
    
    // Rotation animation
    meshRef.current.rotation.y = clock.elapsedTime * 2;
    meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.5) * 0.2;

    // Pulsing glow
    if (glowRef.current) {
      glowRef.current.intensity = 1.5 + Math.sin(clock.elapsedTime * 3) * 0.5;
    }

    // Check collection
    const distance = meshRef.current.position.distanceTo(playerPosition);
    if (distance < COLLECT_DISTANCE) {
      collectItem(index);
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh ref={meshRef}>
        {/* Crystal/gem shape */}
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial 
          color="#00ff88"
          emissive="#00ff44"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Glow effect */}
      <pointLight 
        ref={glowRef}
        color="#00ff88" 
        intensity={1.5} 
        distance={5}
      />
    </group>
  );
}
