"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "@/lib/game-store";
import { SkeletonUtils } from "three-stdlib";

const ALLIGATOR_SPEED = 0.01;
const CATCH_DISTANCE = 2;

interface AlligatorProps {
  initialPosition: THREE.Vector3;
  index: number;
}

export function Alligator({ initialPosition, index }: AlligatorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/alligator.glb");
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, groupRef);
  
  const { 
    playerPosition, 
    isMoving, 
    isRevealing,
    alligatorPositions,
    setAlligatorPositions,
    setGameOver,
    gameOver
  } = useGameStore();

  useEffect(() => {
    // Play walk animation - check various possible animation names
    const walkAction = actions["Walking"] || actions["walking"] || actions["Walk"] || actions["walk"] || Object.values(actions)[0];
    if (walkAction) {
      walkAction.reset().fadeIn(0.5).play();
      walkAction.timeScale = 0.8;
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

    // Set visibility based on reveal state (space held AND not moving)
    const shouldBeVisible = isRevealing && !isMoving;
    
    // Fade effect for visibility
    groupRef.current.visible = true;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (!mat.transparent) {
          mat.transparent = true;
        }
        mat.opacity = THREE.MathUtils.lerp(
          mat.opacity,
          shouldBeVisible ? 1 : 0,
          0.1
        );
      }
    });
  });

  return (
    <group ref={groupRef} position={initialPosition.toArray()}>
      <primitive object={clonedScene} scale={1.5} />
    </group>
  );
}

useGLTF.preload("/models/alligator.glb");
