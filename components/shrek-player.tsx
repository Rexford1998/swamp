"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "@/lib/game-store";

const MOVE_SPEED = 0.08;
const ROTATION_SPEED = 0.05;

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
    
    if (!isHoldingSpace) {
      // Rotation
      if (keys.has("a") || keys.has("arrowleft")) {
        groupRef.current.rotation.y += ROTATION_SPEED;
      }
      if (keys.has("d") || keys.has("arrowright")) {
        groupRef.current.rotation.y -= ROTATION_SPEED;
      }

      // Movement
      if (keys.has("w") || keys.has("arrowup")) {
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(groupRef.current.quaternion);
        groupRef.current.position.add(direction.multiplyScalar(MOVE_SPEED));
        isCurrentlyMoving = true;
      }
      if (keys.has("s") || keys.has("arrowdown")) {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(groupRef.current.quaternion);
        groupRef.current.position.add(direction.multiplyScalar(MOVE_SPEED * 0.5));
        isCurrentlyMoving = true;
      }
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
      <primitive object={scene} scale={1.5} />
      {/* Point light following Shrek for visibility */}
      <pointLight intensity={2} distance={8} color="#556b2f" position={[0, 3, 0]} />
    </group>
  );
}

useGLTF.preload("/models/shrek.glb");
