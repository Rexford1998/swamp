"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "@/lib/game-store";

const MOVE_SPEED = 15;

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
      keysPressed.current.add(e.key);
      if (e.key === " ") {
        setIsRevealing(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
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

  useFrame((_, delta) => {
    if (!groupRef.current || gameOver) return;

    const keys = keysPressed.current;
    let isCurrentlyMoving = false;
    
    // Don't move if revealing (holding space)
    const isHoldingSpace = keys.has(" ");
    
    // Direct WASD movement (not tank controls)
    const moveDirection = new THREE.Vector3(0, 0, 0);
    
    if (keys.has("w") || keys.has("W") || keys.has("ArrowUp")) {
      moveDirection.z -= 1;
    }
    if (keys.has("s") || keys.has("S") || keys.has("ArrowDown")) {
      moveDirection.z += 1;
    }
    if (keys.has("a") || keys.has("A") || keys.has("ArrowLeft")) {
      moveDirection.x -= 1;
    }
    if (keys.has("d") || keys.has("D") || keys.has("ArrowRight")) {
      moveDirection.x += 1;
    }
    
    // Debug log
    if (keys.size > 0) {
      console.log("[v0] Keys pressed:", Array.from(keys), "moveDirection:", moveDirection.toArray());
    }
    
    // Apply movement if there's any input and not holding space
    if (moveDirection.length() > 0 && !isHoldingSpace) {
      // Use delta time for frame-rate independent movement
      const speed = MOVE_SPEED * delta * 60;
      moveDirection.normalize().multiplyScalar(speed);
      groupRef.current.position.x += moveDirection.x;
      groupRef.current.position.z += moveDirection.z;
      isCurrentlyMoving = true;
      
      // Rotate Shrek to face movement direction (add PI so character faces forward)
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z) + Math.PI;
      groupRef.current.rotation.y = targetRotation;
      
      console.log("[v0] Player position:", groupRef.current.position.toArray());
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
      {/* Fixed scale - rotation handled dynamically in useFrame */}
      <primitive object={scene} scale={[1.5, 1.5, 1.5]} />
      {/* Point light following Shrek for visibility */}
      <pointLight intensity={3} distance={12} color="#7a9f5a" position={[0, 3, 0]} />
    </group>
  );
}

useGLTF.preload("/models/shrek.glb");
