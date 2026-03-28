"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { ShrekPlayer } from "./shrek-player";
import { Alligator } from "./alligator";
import { SwampEnvironment } from "./swamp-environment";
import { CameraController } from "./camera-controller";
import { Collectible } from "./collectible";
import { useGameStore } from "@/lib/game-store";

function Lights() {
  return (
    <>
      {/* Brighter ambient for better visibility */}
      <ambientLight intensity={0.4} color="#8ab38a" />
      
      {/* Sunlight filtering through trees */}
      <directionalLight 
        position={[20, 40, 10]} 
        intensity={0.8} 
        color="#fffacd"
        castShadow
      />
      
      {/* Secondary fill light */}
      <directionalLight 
        position={[-15, 20, -10]} 
        intensity={0.3} 
        color="#87ceeb"
      />
      
      {/* Ground bounce light */}
      <pointLight 
        position={[0, -2, 0]} 
        intensity={0.5} 
        distance={60} 
        color="#5a7a5a" 
      />
    </>
  );
}

function Collectibles() {
  const { collectibles, gameOver, gameWon } = useGameStore();
  
  if (gameOver || gameWon) return null;
  
  return (
    <>
      {collectibles.map((collectible, index) => (
        <Collectible 
          key={collectible.id}
          collectible={collectible}
          animationOffset={index}
        />
      ))}
    </>
  );
}

function Alligators() {
  const { gameOver } = useGameStore();
  
  const initialPositions = [
    new THREE.Vector3(15, 0, 10),
    new THREE.Vector3(-12, 0, 15),
    new THREE.Vector3(8, 0, -18),
    new THREE.Vector3(-15, 0, -10),
    new THREE.Vector3(20, 0, 0),
  ];

  if (gameOver) return null;

  return (
    <>
      {initialPositions.map((pos, index) => (
        <Alligator 
          key={`alligator-${index}`}
          initialPosition={pos}
          index={index}
        />
      ))}
    </>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="#556b2f" />
    </mesh>
  );
}

export function GameScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Auto-focus the container so keyboard events work
    containerRef.current?.focus();
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-screen" 
      tabIndex={0} 
      style={{ outline: 'none' }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 12, 10], fov: 60 }}
        gl={{ antialias: true }}
      >
        {/* Lighter fog for swamp atmosphere */}
        <fog attach="fog" args={["#4a6a4a", 15, 60]} />
        <color attach="background" args={["#2a4a3a"]} />
        
        <Lights />
        <CameraController />
        
        <Suspense fallback={<LoadingFallback />}>
          <ShrekPlayer />
          <Alligators />
          <Collectibles />
          <SwampEnvironment />
        </Suspense>
      </Canvas>
    </div>
  );
}
