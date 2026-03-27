"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, CollectibleData } from "@/lib/game-store";

const COLLECT_DISTANCE = 2;

interface CollectibleProps {
  collectible: CollectibleData;
  animationOffset: number;
}

export function Collectible({ collectible, animationOffset }: CollectibleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const { playerPosition, collectItem, gameOver, gameWon } = useGameStore();
  const collectedRef = useRef(false);

  useFrame(({ clock }) => {
    if (!meshRef.current || gameOver || gameWon || collectedRef.current) return;

    // Floating animation
    meshRef.current.position.y = collectible.position.y + Math.sin(clock.elapsedTime * 2 + animationOffset) * 0.3;
    
    // Rotation animation
    meshRef.current.rotation.y = clock.elapsedTime * 2;
    meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.5) * 0.2;

    // Pulsing glow
    if (glowRef.current) {
      glowRef.current.intensity = 1.5 + Math.sin(clock.elapsedTime * 3) * 0.5;
    }

    // Check collection - use local ref to prevent multiple calls
    const distance = new THREE.Vector3(
      collectible.position.x,
      meshRef.current.position.y,
      collectible.position.z
    ).distanceTo(playerPosition);
    
    if (distance < COLLECT_DISTANCE && !collectedRef.current) {
      collectedRef.current = true;
      collectItem(collectible.id);
    }
  });

  // Don't render if already collected
  if (collectible.collected) return null;

  return (
    <group position={[collectible.position.x, collectible.position.y, collectible.position.z]}>
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
