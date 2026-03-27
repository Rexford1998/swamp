import { create } from "zustand";
import * as THREE from "three";

interface GameState {
  playerPosition: THREE.Vector3;
  playerRotation: number;
  isMoving: boolean;
  isRevealing: boolean;
  alligatorPositions: THREE.Vector3[];
  gameOver: boolean;
  
  setPlayerPosition: (position: THREE.Vector3) => void;
  setPlayerRotation: (rotation: number) => void;
  setIsMoving: (moving: boolean) => void;
  setIsRevealing: (revealing: boolean) => void;
  setAlligatorPositions: (positions: THREE.Vector3[]) => void;
  setGameOver: (over: boolean) => void;
  resetGame: () => void;
}

const initialAlligatorPositions = [
  new THREE.Vector3(15, 0, 10),
  new THREE.Vector3(-12, 0, 15),
  new THREE.Vector3(8, 0, -18),
  new THREE.Vector3(-15, 0, -10),
  new THREE.Vector3(20, 0, 0),
];

export const useGameStore = create<GameState>((set) => ({
  playerPosition: new THREE.Vector3(0, 0, 0),
  playerRotation: 0,
  isMoving: false,
  isRevealing: false,
  alligatorPositions: initialAlligatorPositions.map(p => p.clone()),
  gameOver: false,
  
  setPlayerPosition: (position) => set({ playerPosition: position }),
  setPlayerRotation: (rotation) => set({ playerRotation: rotation }),
  setIsMoving: (moving) => set({ isMoving: moving }),
  setIsRevealing: (revealing) => set({ isRevealing: revealing }),
  setAlligatorPositions: (positions) => set({ alligatorPositions: positions }),
  setGameOver: (over) => set({ gameOver: over }),
  resetGame: () => set({
    playerPosition: new THREE.Vector3(0, 0, 0),
    playerRotation: 0,
    isMoving: false,
    isRevealing: false,
    alligatorPositions: initialAlligatorPositions.map(p => p.clone()),
    gameOver: false,
  }),
}));
