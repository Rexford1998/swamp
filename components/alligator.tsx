"use client";

import { useRef, useEffect, useMemo, useState } from "react";
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
  const [currentOpacity, setCurrentOpacity] = useState(0);
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        child.material = (child.material as THREE.Material).clone();
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.transparent = true;
        mat.opacity = 0;
        mat.side = THREE.DoubleSide;
        mat.depthWrite = false;
        mat.needsUpdate = true;
      }
    });
    return clone;
  }, [scene]);
  
  const { actions } = useAnimations(animations, groupRef);
  
  const { 
    playerPosition, 
    isRevealing,
    alligatorPositions,
    setAlligatorPositions,
    setGameOver,
    gameOver
  } = useGameStore();

  useEffect(() => {
    const walkAction = actions["Walk"] || actions["walk"] || Object.values(actions)[0];
    if (walkAction) {
      walkAction.play();
      walkAction.timeScale = 0.5;
    }
  }, [actions]);

  useFrame(() => {
    if (!groupRef.current) return;

    // VISIBILITY: Visible when spacebar pressed OR when game over
    const shouldBeVisible = isRevealing || gameOver;
    const targetOpacity = shouldBeVisible ? 1 : 0;
    const newOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, 0.1);
    
    if (index === 0) {
      console.log("[v0] Alligator 0 - isRevealing:", isRevealing, "gameOver:", gameOver, "targetOpacity:", targetOpacity, "currentOpacity:", newOpacity.toFixed(2));
    }
    
    setCurrentOpacity(newOpacity);
    
    // Update material opacity
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.opacity = newOpacity;
        mat.depthWrite = newOpacity > 0.5;
        mat.visible = newOpacity > 0.01;
      }
    });

    if (gameOver) return;

    // Slowly follow the player
    const direction = new THREE.Vector3()
      .subVectors(playerPosition, groupRef.current.position)
      .normalize();
    
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
  });

  // Always render with a visible placeholder when revealing
  const showGlow = isRevealing || gameOver;

  return (
    <group ref={groupRef} position={initialPosition.toArray()}>
      <primitive object={clonedScene} scale={2} />
      {/* Debug sphere to see position - visible when revealing */}
      {showGlow && (
        <>
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
          </mesh>
          <pointLight 
            intensity={2} 
            distance={8} 
            color="#ff4444" 
            position={[0, 2, 0]} 
          />
        </>
      )}
    </group>
  );
}

useGLTF.preload("/models/alligator.glb");
