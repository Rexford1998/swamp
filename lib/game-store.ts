import { create } from "zustand";
import * as THREE from "three";

// Generate random collectible positions
function generateCollectiblePositions(): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < 20; i++) {
    const x = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 50;
    // Avoid center spawn area
    if (Math.abs(x) > 8 || Math.abs(z) > 8) {
      positions.push(new THREE.Vector3(x, 0.5, z));
    } else {
      // If too close to center, push it further out
      positions.push(new THREE.Vector3(x + (x > 0 ? 10 : -10), 0.5, z + (z > 0 ? 10 : -10)));
    }
  }
  return positions;
}

interface GameState {
  playerPosition: THREE.Vector3;
  playerRotation: number;
  isMoving: boolean;
  isRevealing: boolean;
  alligatorPositions: THREE.Vector3[];
  gameOver: boolean;
  gameWon: boolean;
  collectedItems: number;
  collectiblePositions: THREE.Vector3[];
  
  setPlayerPosition: (position: THREE.Vector3) => void;
  setPlayerRotation: (rotation: number) => void;
  setIsMoving: (moving: boolean) => void;
  setIsRevealing: (revealing: boolean) => void;
  setAlligatorPositions: (positions: THREE.Vector3[]) => void;
  setGameOver: (over: boolean) => void;
  setGameWon: (won: boolean) => void;
  collectItem: (index: number) => void;
  resetGame: () => void;
}

const initialAlligatorPositions = [
  new THREE.Vector3(15, 0, 10),
  new THREE.Vector3(-12, 0, 15),
  new THREE.Vector3(8, 0, -18),
  new THREE.Vector3(-15, 0, -10),
  new THREE.Vector3(20, 0, 0),
];

export const useGameStore = create<GameState>((set, get) => ({
  playerPosition: new THREE.Vector3(0, 0, 0),
  playerRotation: 0,
  isMoving: false,
  isRevealing: false,
  alligatorPositions: initialAlligatorPositions.map(p => p.clone()),
  gameOver: false,
  gameWon: false,
  collectedItems: 0,
  collectiblePositions: generateCollectiblePositions(),
  
  setPlayerPosition: (position) => set({ playerPosition: position }),
  setPlayerRotation: (rotation) => set({ playerRotation: rotation }),
  setIsMoving: (moving) => set({ isMoving: moving }),
  setIsRevealing: (revealing) => set({ isRevealing: revealing }),
  setAlligatorPositions: (positions) => set({ alligatorPositions: positions }),
  setGameOver: (over) => set({ gameOver: over }),
  setGameWon: (won) => set({ gameWon: won }),
  collectItem: (index) => {
    const state = get();
    const newPositions = [...state.collectiblePositions];
    newPositions.splice(index, 1);
    const newCollected = state.collectedItems + 1;
    set({ 
      collectiblePositions: newPositions, 
      collectedItems: newCollected,
      gameWon: newCollected >= 20
    });
  },
  resetGame: () => set({
    playerPosition: new THREE.Vector3(0, 0, 0),
    playerRotation: 0,
    isMoving: false,
    isRevealing: false,
    alligatorPositions: initialAlligatorPositions.map(p => p.clone()),
    gameOver: false,
    gameWon: false,
    collectedItems: 0,
    collectiblePositions: generateCollectiblePositions(),
  }),
}));
