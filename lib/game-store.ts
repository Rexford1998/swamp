import { create } from "zustand";
import * as THREE from "three";

export interface CollectibleData {
  id: string;
  position: THREE.Vector3;
  collected: boolean;
}

// Generate random collectible positions with unique IDs
function generateCollectibles(): CollectibleData[] {
  const collectibles: CollectibleData[] = [];
  for (let i = 0; i < 20; i++) {
    let x = (Math.random() - 0.5) * 50;
    let z = (Math.random() - 0.5) * 50;
    // Avoid center spawn area
    if (Math.abs(x) <= 8 && Math.abs(z) <= 8) {
      x = x + (x > 0 ? 10 : -10);
      z = z + (z > 0 ? 10 : -10);
    }
    collectibles.push({
      id: `gem-${i}-${Date.now()}`,
      position: new THREE.Vector3(x, 0.5, z),
      collected: false,
    });
  }
  return collectibles;
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
  collectibles: CollectibleData[];
  
  setPlayerPosition: (position: THREE.Vector3) => void;
  setPlayerRotation: (rotation: number) => void;
  setIsMoving: (moving: boolean) => void;
  setIsRevealing: (revealing: boolean) => void;
  setAlligatorPositions: (positions: THREE.Vector3[]) => void;
  setGameOver: (over: boolean) => void;
  setGameWon: (won: boolean) => void;
  collectItem: (id: string) => void;
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
  collectibles: generateCollectibles(),
  
  setPlayerPosition: (position) => set({ playerPosition: position }),
  setPlayerRotation: (rotation) => set({ playerRotation: rotation }),
  setIsMoving: (moving) => set({ isMoving: moving }),
  setIsRevealing: (revealing) => set({ isRevealing: revealing }),
  setAlligatorPositions: (positions) => set({ alligatorPositions: positions }),
  setGameOver: (over) => set({ gameOver: over }),
  setGameWon: (won) => set({ gameWon: won }),
  collectItem: (id: string) => {
    const state = get();
    const collectible = state.collectibles.find(c => c.id === id);
    // Prevent double collection
    if (!collectible || collectible.collected) return;
    
    const newCollectibles = state.collectibles.map(c => 
      c.id === id ? { ...c, collected: true } : c
    );
    const newCollected = state.collectedItems + 1;
    set({ 
      collectibles: newCollectibles, 
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
    collectibles: generateCollectibles(),
  }),
}));
