"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ShrekPlayer } from "./shrek-player";
import { Alligator } from "./alligator";
import { SwampEnvironment } from "./swamp-environment";
import { CameraController } from "./camera-controller";
import { LoadingScreen } from "./loading-screen";
import { useGameStore } from "@/lib/game-store";

// Preload models
useGLTF.preload("/models/shrek.glb");
useGLTF.preload("/models/alligator.glb");

function RevealLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const { isRevealing, playerPosition } = useGameStore();

  useFrame(() => {
    if (lightRef.current) {
      const targetIntensity = isRevealing ? 50 : 0;
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        targetIntensity,
        0.1
      );
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
      <ambientLight intensity={0.03} color="#1a3a1a" />
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={0.1} 
        color="#3a5a4a"
        castShadow
      />
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
  const { gameStarted } = useGameStore();
  
  const initialPositions = [
    new THREE.Vector3(15, 0, 10),
    new THREE.Vector3(-12, 0, 15),
    new THREE.Vector3(8, 0, -18),
    new THREE.Vector3(-15, 0, -10),
    new THREE.Vector3(20, 0, 0),
  ];

  // Don't unmount on gameOver - keep alligators visible
  if (!gameStarted) return null;

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

// Component to signal when scene is ready
function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    // Signal ready after a short delay to ensure everything is rendered
    const timer = setTimeout(() => {
      console.log("[v0] Scene ready");
      onReady();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onReady]);
  
  return null;
}

export function GameScene() {
  const { gameStarted } = useGameStore();
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-screen relative">
      <LoadingScreen isLoaded={isLoaded} />
      
      <Canvas
        shadows
        camera={{ position: [0, 12, 10], fov: 60 }}
        gl={{ antialias: true }}
      >
        <fog attach="fog" args={["#050805", 5, 45]} />
        <color attach="background" args={["#030503"]} />
        
        <Lights />
        <RevealLight />
        <CameraController />
        
        <Suspense fallback={null}>
          {gameStarted && <ShrekPlayer />}
          <Alligators />
          <SwampEnvironment />
          <SceneReady onReady={() => setIsLoaded(true)} />
        </Suspense>
      </Canvas>
    </div>
  );
}
