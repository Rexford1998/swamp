"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGameStore } from "@/lib/game-store";
import * as THREE from "three";

const CAMERA_HEIGHT = 18;
const CAMERA_OFFSET_Z = 12;
const LERP_FACTOR = 0.08;

export function CameraController() {
  const { camera } = useThree();
  const { playerPosition } = useGameStore();

  useFrame(() => {
    // Fixed camera angle - always behind and above player looking down
    // This makes controls intuitive: up=forward, down=back, left=left, right=right
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
