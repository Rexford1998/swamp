"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { ShrekPlayer } from "./shrek-player";
import { Alligator } from "./alligator";
import { SwampEnvironment } from "./swamp-environment";
import { CameraController } from "./camera-controller";
import { useGameStore } from "@/lib/game-store";

function Lights() {
  return (
    <>
      {/* Very dim ambient for oppressive atmosphere */}
      <ambientLight intensity={0.05} color="#1a3a1a" />
      
      {/* Distant eerie moonlight */}
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={0.15} 
        color="#4a6a5a"
        castShadow
      />
      
      {/* Subtle fog glow from below */}
      <pointLight 
        position={[0, -2, 0]} 
        intensity={0.3} 
        distance={50} 
        color="#2a4a2a" 
      />
    </>
  );
}

function Alligators() {
  const { alligatorPositions, gameOver } = useGameStore();
  
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
  return (
    <div className="w-full h-screen">
      <Canvas
        shadows
        camera={{ position: [0, 12, 10], fov: 60 }}
        gl={{ antialias: true }}
      >
        {/* Dark fog for atmosphere */}
        <fog attach="fog" args={["#0a0f0a", 5, 40]} />
        <color attach="background" args={["#050a05"]} />
        
        <Lights />
        <CameraController />
        
        <Suspense fallback={<LoadingFallback />}>
          <ShrekPlayer />
          <Alligators />
          <SwampEnvironment />
        </Suspense>
      </Canvas>
    </div>
  );
}
