"use client";

import { useGameStore } from "@/lib/game-store";

function MiniMap() {
  const { playerPosition, playerRotation, alligatorPositions, collectibles, isRevealing, isMoving } = useGameStore();
  const canSeeAlligators = isRevealing && !isMoving;
  
  // Map scale: 60 units game space = 150px map space
  const mapSize = 150;
  const gameSize = 60;
  const scale = mapSize / gameSize;
  
  const toMapCoords = (x: number, z: number) => ({
    x: (x + gameSize / 2) * scale,
    y: (z + gameSize / 2) * scale,
  });
  
  const playerMap = toMapCoords(playerPosition.x, playerPosition.z);
  
  return (
    <div className="absolute top-4 right-4 w-[150px] h-[150px] bg-background/80 border-2 border-accent/50 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-[#1a3a2a]/80" />
      
      {/* Collectibles on map - only show uncollected ones */}
      {collectibles.filter(c => !c.collected).map((collectible) => {
        const mapPos = toMapCoords(collectible.position.x, collectible.position.z);
        return (
          <div
            key={collectible.id}
            className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
            style={{
              left: mapPos.x - 4,
              top: mapPos.y - 4,
            }}
          />
        );
      })}
      
      {/* Alligators on map (only visible when revealing) */}
      {canSeeAlligators && alligatorPositions.map((pos, i) => {
        const mapPos = toMapCoords(pos.x, pos.z);
        return (
          <div
            key={`map-gator-${i}`}
            className="absolute w-3 h-3 bg-red-500 rounded-full"
            style={{
              left: mapPos.x - 6,
              top: mapPos.y - 6,
            }}
          />
        );
      })}
      
      {/* Player indicator */}
      <div
        className="absolute w-4 h-4 flex items-center justify-center"
        style={{
          left: playerMap.x - 8,
          top: playerMap.y - 8,
          transform: `rotate(${-playerRotation}rad)`,
        }}
      >
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-green-400" />
      </div>
      
      {/* Map label */}
      <div className="absolute bottom-1 left-1 text-[10px] text-muted-foreground font-mono">
        RADAR
      </div>
    </div>
  );
}

function GogglesOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Goggle frame - circular viewfinders */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Left lens */}
        <div className="absolute left-[10%] w-[35%] h-[70%] rounded-full border-[8px] border-[#1a2a1a] bg-transparent shadow-[inset_0_0_60px_rgba(0,255,100,0.3)]" />
        {/* Right lens */}
        <div className="absolute right-[10%] w-[35%] h-[70%] rounded-full border-[8px] border-[#1a2a1a] bg-transparent shadow-[inset_0_0_60px_rgba(0,255,100,0.3)]" />
        {/* Bridge connecting lenses */}
        <div className="absolute w-[15%] h-[15%] bg-[#1a2a1a] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Night vision green tint */}
      <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay" />
      
      {/* Scanlines effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />
      
      {/* Corner vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,20,0,0.8) 100%)',
        }}
      />
      
      {/* HUD elements */}
      <div className="absolute top-8 left-8 text-green-400 font-mono text-sm opacity-80">
        THERMAL SCAN ACTIVE
      </div>
      <div className="absolute top-8 right-8 text-green-400 font-mono text-sm opacity-80 animate-pulse">
        THREATS DETECTED
      </div>
    </div>
  );
}

export function GameUI() {
  const { isRevealing, isMoving, gameOver, gameWon, collectedItems, resetGame } = useGameStore();
  const canSeeAlligators = isRevealing && !isMoving;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Instructions */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
        <h1 className="text-2xl font-bold text-accent mb-2 drop-shadow-lg">
          SWAMP TERROR
        </h1>
        <p className="text-sm text-muted-foreground">
          WASD to move | Hold SPACE while still for thermal goggles | Collect 20 gems to win!
        </p>
      </div>

      {/* Collection counter */}
      <div className="absolute top-4 left-4 bg-background/80 border border-emerald-500/50 rounded-lg px-4 py-2">
        <span className="text-emerald-400 font-bold text-lg">{collectedItems}</span>
        <span className="text-muted-foreground"> / 20 Gems</span>
      </div>

      {/* Mini Map */}
      <MiniMap />

      {/* Goggles overlay when revealing */}
      {canSeeAlligators && <GogglesOverlay />}

      {/* Reveal indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        {isRevealing && !isMoving && (
          <div className="bg-green-900/40 border border-green-500/50 rounded-lg px-4 py-2 animate-pulse">
            <span className="text-green-400 font-semibold">THERMAL VISION ACTIVE</span>
          </div>
        )}
        {isRevealing && isMoving && (
          <div className="bg-primary/20 border border-primary/50 rounded-lg px-4 py-2">
            <span className="text-muted-foreground">Stop moving to activate goggles</span>
          </div>
        )}
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center pointer-events-auto">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-bold text-red-500">CAUGHT!</h2>
            <p className="text-xl text-muted-foreground">
              An alligator got you...
            </p>
            <p className="text-lg text-muted-foreground">
              You collected {collectedItems} / 20 gems
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

      {/* Victory Screen */}
      {gameWon && (
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center pointer-events-auto">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-bold text-emerald-400">VICTORY!</h2>
            <p className="text-xl text-muted-foreground">
              You collected all 20 gems and escaped the swamp!
            </p>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
