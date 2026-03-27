"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import * as THREE from "three";
import { ShrekPlayer } from "./shrek-player";
import { Alligator } from "./alligator";
import { SwampEnvironment } from "./swamp-environment";
import { CameraController } from "./camera-controller";
import { LoadingScreen } from "./loading-screen";
import { useGameStore } from "@/lib/game-store";

function RevealLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const { isRevealing, playerPosition } = useGameStore();

  useFrame(() => {
    if (lightRef.current) {
      // Smoothly transition light intensity
      const targetIntensity = isRevealing ? 50 : 0;
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        targetIntensity,
        0.1
      );
      // Follow player position
      lightRef.current.position.set(playerPosition.x, 15, playerPosition.z);
    }
    if (spotRef.current) {
      const targetIntensity = isRevealing ? 100 : 0;
      spotRef.current.intensity = THREE.MathUtils.lerp(
        spotRef.current.intensity,
        targetIntensity,
        0.1
      );
      spotRef.current.position.set(playerPosition.x, 20, playerPosition.z);
      spotRef.current.target.position.set(playerPosition.x, 0, playerPosition.z);
    }
  });

  return (
    <>
      <pointLight 
        ref={lightRef}
        position={[0, 15, 0]} 
        intensity={0} 
        distance={60} 
        color="#88cc88"
        castShadow
      />
      <spotLight
        ref={spotRef}
        position={[0, 20, 0]}
        intensity={0}
        distance={80}
        angle={Math.PI / 3}
        penumbra={0.5}
        color="#aaddaa"
        castShadow
      />
    </>
  );
}

function Lights() {
  return (
    <>
      {/* Very dim ambient for oppressive atmosphere */}
      <ambientLight intensity={0.03} color="#1a3a1a" />
      
      {/* Distant eerie moonlight */}
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={0.1} 
        color="#3a5a4a"
        castShadow
      />
      
      {/* Subtle fog glow from below */}
      <pointLight 
        position={[0, -2, 0]} 
        intensity={0.2} 
        distance={50} 
        color="#1a3a1a" 
      />
    </>
  );
}

function Alligators() {
  const { gameOver, gameStarted } = useGameStore();
  
  const initialPositions = [
    new THREE.Vector3(15, 0, 10),
    new THREE.Vector3(-12, 0, 15),
    new THREE.Vector3(8, 0, -18),
    new THREE.Vector3(-15, 0, -10),
    new THREE.Vector3(20, 0, 0),
  ];

  if (gameOver || !gameStarted) return null;

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

function InnerLoadingBox() {
  // Simple loading placeholder while models load inside Canvas
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="#556b2f" />
    </mesh>
  );
}

export function GameScene() {
  const { gameStarted } = useGameStore();
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoaded = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="w-full h-screen relative">
      {/* Loading overlay */}
      <LoadingScreen onLoaded={handleLoaded} />
      
      <Canvas
        shadows
        camera={{ position: [0, 12, 10], fov: 60 }}
        gl={{ antialias: true }}
      >
        {/* Dark fog for atmosphere */}
        <fog attach="fog" args={["#050805", 5, 45]} />
        <color attach="background" args={["#030503"]} />
        
        <Lights />
        <RevealLight />
        <CameraController />
        
        <Suspense fallback={<InnerLoadingBox />}>
          {gameStarted && <ShrekPlayer />}
          <Alligators />
          <SwampEnvironment />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
