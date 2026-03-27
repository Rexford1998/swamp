"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/lib/game-store";

const ALLIGATOR_SPEED = 0.015;
const CATCH_DISTANCE = 0.3; // Must be directly on top of player to catch

interface AlligatorProps {
  initialPosition: THREE.Vector3;
  index: number;
}

// Procedural alligator made from basic shapes - no GLB needed
function AlligatorBody({ opacity }: { opacity: number }) {
  const darkGreen = "#2d4a2d";
  const lightGreen = "#3d5a3d";
  const spineGreen = "#1d3a1d";

  return (
    <group visible={opacity > 0.01}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.4, 1.5, 8, 16]} />
        <meshStandardMaterial 
          color={darkGreen} 
          roughness={0.8}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.35, 1.2]}>
        <boxGeometry args={[0.5, 0.3, 0.8]} />
        <meshStandardMaterial 
          color={darkGreen} 
          roughness={0.8}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      {/* Snout */}
      <mesh position={[0, 0.3, 1.8]}>
        <boxGeometry args={[0.35, 0.2, 0.6]} />
        <meshStandardMaterial 
          color={lightGreen} 
          roughness={0.8}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      {/* Eyes - glowing yellow */}
      <mesh position={[-0.2, 0.55, 1.1]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color="#ffff00" 
          emissive="#ffff00"
          emissiveIntensity={opacity * 0.8}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0.2, 0.55, 1.1]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color="#ffff00" 
          emissive="#ffff00"
          emissiveIntensity={opacity * 0.8}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      {/* Tail */}
      <mesh position={[0, 0.25, -1.2]} rotation={[-0.3, 0, 0]}>
        <coneGeometry args={[0.35, 1.4, 8]} />
        <meshStandardMaterial 
          color={darkGreen} 
          roughness={0.8}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      {/* Front Legs */}
      <mesh position={[-0.45, 0.1, 0.6]} rotation={[0, 0, 0.6]}>
        <capsuleGeometry args={[0.1, 0.35, 4, 8]} />
        <meshStandardMaterial color={darkGreen} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.45, 0.1, 0.6]} rotation={[0, 0, -0.6]}>
        <capsuleGeometry args={[0.1, 0.35, 4, 8]} />
        <meshStandardMaterial color={darkGreen} transparent opacity={opacity} />
      </mesh>
      
      {/* Back Legs */}
      <mesh position={[-0.45, 0.1, -0.4]} rotation={[0, 0, 0.6]}>
        <capsuleGeometry args={[0.1, 0.35, 4, 8]} />
        <meshStandardMaterial color={darkGreen} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.45, 0.1, -0.4]} rotation={[0, 0, -0.6]}>
        <capsuleGeometry args={[0.1, 0.35, 4, 8]} />
        <meshStandardMaterial color={darkGreen} transparent opacity={opacity} />
      </mesh>
      
      {/* Spikes on back */}
      {[-0.5, -0.2, 0.1, 0.4].map((z, i) => (
        <mesh key={i} position={[0, 0.7, z]}>
          <coneGeometry args={[0.07, 0.18, 4]} />
          <meshStandardMaterial color={spineGreen} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

export function Alligator({ initialPosition, index }: AlligatorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(0);
  const positionRef = useRef(initialPosition.clone()); // Track position locally
  
  const { 
    playerPosition, 
    gameOver,
    setGameOver,
    isRevealing,
  } = useGameStore();

  useFrame(() => {
    if (!groupRef.current) return;

    // VISIBILITY: Visible when spacebar pressed OR when game over
    const targetOpacity = (isRevealing || gameOver) ? 1 : 0;
    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, targetOpacity, 0.12);

    if (gameOver) return;

    // Slowly follow the player using LOCAL position tracking
    const currentPos = positionRef.current;
    const direction = new THREE.Vector3()
      .subVectors(playerPosition, currentPos)
      .normalize();
    
    // Move towards player - update local position ref
    currentPos.add(direction.multiplyScalar(ALLIGATOR_SPEED));
    
    // Apply position to group
    groupRef.current.position.copy(currentPos);
    
    // Face the player
    const angle = Math.atan2(
      playerPosition.x - currentPos.x,
      playerPosition.z - currentPos.z
    );
    groupRef.current.rotation.y = angle;

    // Check collision - only on XZ plane (ignore Y height differences)
    const alligatorPos2D = new THREE.Vector2(currentPos.x, currentPos.z);
    const playerPos2D = new THREE.Vector2(playerPosition.x, playerPosition.z);
    const distance = alligatorPos2D.distanceTo(playerPos2D);
    
    if (distance < CATCH_DISTANCE) {
      setGameOver(true);
    }
  });

  const showGlow = isRevealing || gameOver;

  return (
    <group ref={groupRef} position={initialPosition.toArray()}>
      <AlligatorBody opacity={opacityRef.current} />
      {/* Red danger glow when visible */}
      {showGlow && (
        <pointLight 
          intensity={1.5} 
          distance={6} 
          color="#ff3333" 
          position={[0, 1, 0]} 
        />
      )}
    </group>
  );
}
