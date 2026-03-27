"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGameStore } from "@/lib/game-store";
import * as THREE from "three";

const CAMERA_HEIGHT = 12;
const CAMERA_DISTANCE = 10;
const LERP_FACTOR = 0.05;

export function CameraController() {
  const { camera } = useThree();
  const { playerPosition, playerRotation } = useGameStore();

  useFrame(() => {
    // Calculate camera position behind player
    const offsetX = Math.sin(playerRotation) * CAMERA_DISTANCE;
    const offsetZ = Math.cos(playerRotation) * CAMERA_DISTANCE;
    
    const targetPosition = new THREE.Vector3(
      playerPosition.x - offsetX,
      CAMERA_HEIGHT,
      playerPosition.z - offsetZ
    );

    // Smoothly lerp camera position
    camera.position.lerp(targetPosition, LERP_FACTOR);
    
    // Look at player
    const lookTarget = new THREE.Vector3(
      playerPosition.x,
      playerPosition.y + 2,
      playerPosition.z
    );
    camera.lookAt(lookTarget);
  });

  return null;
}
