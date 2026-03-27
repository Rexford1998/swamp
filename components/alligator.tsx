"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "@/lib/game-store";

const ALLIGATOR_SPEED = 0.012;
const CATCH_DISTANCE = 2;

interface AlligatorProps {
  initialPosition: THREE.Vector3;
  index: number;
}

export function Alligator({ initialPosition, index }: AlligatorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/alligator.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { actions } = useAnimations(animations, groupRef);
  
  const { 
    playerPosition, 
    isRevealing,
    alligatorPositions,
    setAlligatorPositions,
    setGameOver,
    gameOver
  } = useGameStore();

  // Initialize materials as transparent and invisible
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.transparent = true;
        mat.opacity = 0;
      }
    });
  }, [clonedScene]);

  useEffect(() => {
    // Play walk animation
    const walkAction = actions["Walk"] || actions["walk"] || Object.values(actions)[0];
    if (walkAction) {
      walkAction.play();
      walkAction.timeScale = 0.5;
    }
  }, [actions]);

  useFrame(() => {
    if (!groupRef.current || gameOver) return;

    // Slowly follow the player
    const direction = new THREE.Vector3()
      .subVectors(playerPosition, groupRef.current.position)
      .normalize();
    
    // Move towards player
    groupRef.current.position.add(direction.multiplyScalar(ALLIGATOR_SPEED));
    
    // Face the player
    const angle = Math.atan2(
      playerPosition.x - groupRef.current.position.x,
      playerPosition.z - groupRef.current.position.z
    );
    groupRef.current.rotation.y = angle;

    // Update position in store
    const newPositions = [...alligatorPositions];
    newPositions[index] = groupRef.current.position.clone();
    setAlligatorPositions(newPositions);

    // Check collision
    const distance = groupRef.current.position.distanceTo(playerPosition);
    if (distance < CATCH_DISTANCE) {
      setGameOver(true);
    }

    // VISIBILITY: Only visible when spacebar is pressed (isRevealing is true)
    // Fade in/out based on reveal state
    const targetOpacity = isRevealing ? 1 : 0;
    
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.15);
      }
    });
  });

  return (
    <group ref={groupRef} position={initialPosition.toArray()}>
      <primitive object={clonedScene} scale={2} />
    </group>
  );
}

useGLTF.preload("/models/alligator.glb");
