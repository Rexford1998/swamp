"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "@/lib/game-store";

const MOVE_SPEED = 1.5;

export function ShrekPlayer() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/shrek.glb");
  const { actions } = useAnimations(animations, groupRef);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const { 
    setPlayerPosition, 
    setPlayerRotation, 
    setIsMoving, 
    setIsRevealing,
    gameOver 
  } = useGameStore();

  useEffect(() => {
    // Play walk animation if available
    const walkAction = actions["Walk"] || actions["walk"] || Object.values(actions)[0];
    if (walkAction) {
      walkAction.play();
    }
  }, [actions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      if (e.key === " ") {
        setIsRevealing(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
      if (e.key === " ") {
        setIsRevealing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setIsRevealing]);

  useFrame(() => {
    if (!groupRef.current || gameOver) return;

    const keys = keysPressed.current;
    let isCurrentlyMoving = false;
    
    // Don't move if revealing (holding space)
    const isHoldingSpace = keys.has(" ");
    
    // Direct WASD movement (not tank controls)
    const moveDirection = new THREE.Vector3(0, 0, 0);
    
    if (keys.has("w") || keys.has("arrowup")) {
      moveDirection.z -= 1; // Move forward (negative Z)
    }
    if (keys.has("s") || keys.has("arrowdown")) {
      moveDirection.z += 1; // Move backward (positive Z)
    }
    if (keys.has("a") || keys.has("arrowleft")) {
      moveDirection.x -= 1; // Move left (negative X)
    }
    if (keys.has("d") || keys.has("arrowright")) {
      moveDirection.x += 1; // Move right (positive X)
    }
    
    // Apply movement if there's any input and not holding space
    if (moveDirection.length() > 0 && !isHoldingSpace) {
      moveDirection.normalize().multiplyScalar(MOVE_SPEED);
      groupRef.current.position.add(moveDirection);
      isCurrentlyMoving = true;
      
      // Rotate Shrek to face movement direction (add PI to flip 180 degrees)
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z) + Math.PI;
      groupRef.current.rotation.y = targetRotation;
    }

    // Clamp position to swamp boundaries
    groupRef.current.position.x = THREE.MathUtils.clamp(groupRef.current.position.x, -30, 30);
    groupRef.current.position.z = THREE.MathUtils.clamp(groupRef.current.position.z, -30, 30);

    setIsMoving(isCurrentlyMoving);
    setPlayerPosition(groupRef.current.position.clone());
    setPlayerRotation(groupRef.current.rotation.y);

    // Update animation speed based on movement
    const walkAction = actions["Walk"] || actions["walk"] || Object.values(actions)[0];
    if (walkAction) {
      walkAction.timeScale = isCurrentlyMoving ? 1 : 0;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Fixed scale to prevent squishing - uniform scale on all axes */}
      <primitive object={scene} scale={[1.5, 1.5, 1.5]} />
      {/* Point light following Shrek for visibility */}
      <pointLight intensity={3} distance={12} color="#7a9f5a" position={[0, 3, 0]} />
    </group>
  );
}

useGLTF.preload("/models/shrek.glb");
