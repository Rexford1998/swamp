"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isLoaded: boolean;
}

export function LoadingScreen({ isLoaded }: LoadingScreenProps) {
  const [showLoading, setShowLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    if (!isLoaded) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      // When loaded, quickly complete to 100%
      setProgress(100);
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  if (!showLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030503]">
      {/* Floating bubbles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#2a4a2a]/30 animate-pulse"
            style={{
              width: `${20 + (i * 3)}px`,
              height: `${20 + (i * 3)}px`,
              left: `${(i * 7) % 100}%`,
              top: `${(i * 11) % 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <h1
        className="relative text-5xl md:text-7xl font-bold text-[#5a9a5a] tracking-wider mb-8"
        style={{
          fontFamily: "var(--font-creepster), 'Creepster', cursive, sans-serif",
          textShadow: `
            0 0 20px #4a8a4a,
            0 0 40px #3a7a3a,
            0 0 60px #2a6a2a
          `,
        }}
      >
        LOADING...
      </h1>

      {/* Progress bar container */}
      <div className="w-64 md:w-80 h-4 bg-[#1a2a1a] rounded-full border border-[#3a5a3a]/50 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#3a6a3a] to-[#5a9a5a] transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Progress text */}
      <p className="mt-4 text-[#6a9a6a] text-lg">
        {Math.round(Math.min(progress, 100))}%
      </p>

      {/* Loading message */}
      <p className="mt-8 text-[#5a7a5a] text-sm italic animate-pulse">
        Entering the swamp...
      </p>
    </div>
  );
}
