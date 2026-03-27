"use client";

import dynamic from "next/dynamic";
import { GameUI } from "@/components/game-ui";

// Dynamic import to avoid SSR issues with Three.js
const GameScene = dynamic(
  () => import("@/components/game-scene").then((mod) => mod.GameScene),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Swamp Terror...</p>
        </div>
      </div>
    )
  }
);

export default function SwampTerrorPage() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-background">
      <GameScene />
      <GameUI />
    </main>
  );
}
