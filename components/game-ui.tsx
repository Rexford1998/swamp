"use client";

import { useGameStore } from "@/lib/game-store";

function FloatingBubble({ className }: { className: string }) {
  return (
    <div 
      className={`absolute rounded-full border border-[#3a5a3a]/40 bg-[#2a4a2a]/10 ${className}`}
    />
  );
}

function StartScreen() {
  const { startGame } = useGameStore();

  return (
    <div className="absolute inset-0 z-20 bg-[#0a0f0a] flex flex-col items-center justify-center overflow-hidden">
      {/* Floating bubbles decoration */}
      <FloatingBubble className="w-4 h-4 top-[20%] left-[15%] animate-pulse" />
      <FloatingBubble className="w-8 h-8 top-[40%] right-[20%] animate-pulse delay-300" />
      <FloatingBubble className="w-6 h-6 bottom-[30%] left-[25%] animate-pulse delay-500" />
      <FloatingBubble className="w-12 h-12 bottom-[20%] right-[15%] animate-pulse delay-700" />
      <FloatingBubble className="w-3 h-3 top-[60%] left-[10%] animate-pulse delay-200" />
      <FloatingBubble className="w-5 h-5 top-[30%] right-[30%] animate-pulse delay-400" />
      <FloatingBubble className="w-10 h-10 bottom-[40%] right-[25%] animate-pulse delay-600" />
      
      {/* Main title with glow effect */}
      <div className="relative mb-8">
        {/* Glow background */}
        <div className="absolute inset-0 blur-[60px] bg-[#4a8a4a] opacity-60 scale-150" />
        
        <h1 
          className="relative text-6xl md:text-8xl font-bold text-[#5a9a5a] tracking-wider"
          style={{
            fontFamily: "var(--font-creepster), 'Creepster', cursive, sans-serif",
            textShadow: `
              0 0 20px #4a8a4a,
              0 0 40px #3a7a3a,
              0 0 60px #2a6a2a,
              0 0 80px #1a5a1a
            `,
          }}
        >
          SWAMP
        </h1>
        <h1 
          className="relative text-6xl md:text-8xl font-bold text-[#8a4a3a] tracking-wider -mt-2"
          style={{
            fontFamily: "var(--font-creepster), 'Creepster', cursive, sans-serif",
            textShadow: `
              0 0 20px #6a3a2a,
              0 0 40px #5a2a1a,
              0 0 60px #4a1a0a
            `,
          }}
        >
          TERROR
        </h1>
      </div>

      {/* Description text */}
      <div className="text-center max-w-lg px-6 mb-8 space-y-4">
        <p className="text-[#a89a7a] text-lg leading-relaxed">
          You are stranded in an alligator-infested swamp.
        </p>
        <p className="text-[#a89a7a] text-lg leading-relaxed">
          Press <span className="text-[#5a9a5a] font-semibold">SPACE</span> to see underwater — but you{" "}
          <em className="text-[#a89a7a]">cannot move</em> while looking.
        </p>
        <p className="text-[#a89a7a] text-lg leading-relaxed">
          Move without looking and the gators close in, completely unseen.
        </p>
        <p className="text-[#c54a3a] text-lg font-semibold mt-6">
          Survive as long as you can.
        </p>
      </div>

      {/* Enter button */}
      <button
        onClick={startGame}
        className="mt-4 px-12 py-4 border-2 border-[#5a9a5a] text-[#5a9a5a] font-bold text-xl tracking-widest
                   hover:bg-[#5a9a5a]/20 transition-all duration-300 uppercase"
        style={{
          fontFamily: "var(--font-creepster), 'Creepster', cursive, sans-serif",
          textShadow: "0 0 10px #3a7a3a",
        }}
      >
        ENTER THE SWAMP
      </button>
    </div>
  );
}

export function GameUI() {
  const { gameStarted, isRevealing, gameOver, resetGame } = useGameStore();

  if (!gameStarted) {
    return <StartScreen />;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Instructions */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
        <p className="text-sm text-[#8a9a7a]">
          WASD or Arrow Keys to move | Hold SPACE to reveal alligators (stops movement)
        </p>
      </div>

      {/* Reveal indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        {isRevealing && (
          <div className="bg-[#5a9a5a]/20 border border-[#5a9a5a]/50 rounded-lg px-6 py-3 animate-pulse">
            <span className="text-[#5a9a5a] font-semibold tracking-wide">REVEALING DANGER...</span>
          </div>
        )}
      </div>

      {/* Vision glow overlay when revealing */}
      {isRevealing && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(90,154,90,0.1) 0%, transparent 70%)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-[#0a0f0a]/95 flex items-center justify-center pointer-events-auto">
          <div className="text-center space-y-6">
            <h2 
              className="text-6xl font-bold text-[#c54a3a]"
              style={{
                fontFamily: "var(--font-creepster), 'Creepster', cursive, sans-serif",
                textShadow: "0 0 20px #a53a2a, 0 0 40px #852a1a",
              }}
            >
              CAUGHT!
            </h2>
            <p className="text-xl text-[#a89a7a]">
              An alligator got you...
            </p>
            <button
              onClick={resetGame}
              className="px-10 py-4 border-2 border-[#5a9a5a] text-[#5a9a5a] font-bold text-lg tracking-widest
                         hover:bg-[#5a9a5a]/20 transition-all duration-300 uppercase"
              style={{
                fontFamily: "var(--font-creepster), 'Creepster', cursive, sans-serif",
              }}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
