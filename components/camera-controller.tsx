"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGameStore } from "@/lib/game-store";
import * as THREE from "three";

const CAMERA_HEIGHT = 15;
const CAMERA_OFFSET_Z = 8;
const LERP_FACTOR = 0.08;

export function CameraController() {
  const { camera } = useThree();
  const { playerPosition } = useGameStore();

  useFrame(() => {
    // Fixed angle camera that follows player from behind/above
    const targetPosition = new THREE.Vector3(
      playerPosition.x,
      CAMERA_HEIGHT,
      playerPosition.z + CAMERA_OFFSET_Z
    );

    // Smoothly lerp camera position
    camera.position.lerp(targetPosition, LERP_FACTOR);
    
    // Look at player
    const lookTarget = new THREE.Vector3(
      playerPosition.x,
      playerPosition.y + 1,
      playerPosition.z
    );
    camera.lookAt(lookTarget);
  });

  return null;
}
