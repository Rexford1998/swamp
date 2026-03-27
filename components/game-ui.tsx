"use client";

import { useGameStore } from "@/lib/game-store";

export function GameUI() {
  const { isRevealing, isMoving, gameOver, resetGame } = useGameStore();
  const canSeeAlligators = isRevealing && !isMoving;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Instructions */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
        <h1 className="text-2xl font-bold text-accent mb-2 drop-shadow-lg">
          SWAMP TERROR
        </h1>
        <p className="text-sm text-muted-foreground">
          WASD or Arrow Keys to move | Hold SPACE while still to reveal alligators
        </p>
      </div>

      {/* Reveal indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        {isRevealing && !isMoving && (
          <div className="bg-accent/20 border border-accent/50 rounded-lg px-4 py-2 animate-pulse">
            <span className="text-accent font-semibold">REVEALING DANGER...</span>
          </div>
        )}
        {isRevealing && isMoving && (
          <div className="bg-primary/20 border border-primary/50 rounded-lg px-4 py-2">
            <span className="text-muted-foreground">Stop moving to see alligators</span>
          </div>
        )}
      </div>

      {/* Vision indicator */}
      {canSeeAlligators && (
        <div className="absolute inset-0 border-4 border-accent/30 pointer-events-none animate-pulse" />
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center pointer-events-auto">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-bold text-red-500">CAUGHT!</h2>
            <p className="text-xl text-muted-foreground">
              An alligator got you...
            </p>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-accent/80 transition-colors"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
