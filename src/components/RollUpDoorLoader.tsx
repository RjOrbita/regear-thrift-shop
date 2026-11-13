"use client";

import React, { useEffect, useState } from "react";
import { ChevronUp, LockOpen } from "lucide-react";

export default function RollUpDoorLoader() {
  const [phase, setPhase] = useState<"closed" | "opening" | "opened">("closed");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate loading percentage up to 100%, then automatically roll up the shutter
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 35);

    const openTimer = setTimeout(() => {
      setPhase("opening");
    }, 950);

    const unmountTimer = setTimeout(() => {
      setPhase("opened");
    }, 2050);

    return () => {
      clearInterval(interval);
      clearTimeout(openTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  const triggerImmediateOpen = () => {
    if (phase === "closed") {
      setProgress(100);
      setPhase("opening");
      setTimeout(() => setPhase("opened"), 1050);
    }
  };

  if (phase === "opened") return null;

  return (
    <div
      onClick={triggerImmediateOpen}
      onTouchStart={triggerImmediateOpen}
      className="fixed inset-0 z-[100] overflow-hidden pointer-events-auto select-none cursor-pointer"
      aria-label="Opening ReGear Thrift Shop Shutter"
    >
      {/* Top Steel Roll Housing / Header Box */}
      <div className="relative z-20 h-4 w-full bg-[#111111] border-b-2 border-[#2A2A2A] shadow-md" />

      {/* Main Corrugated Roll-Up Garage Door Curtain */}
      <div
        className={`relative w-full h-[calc(100%-1rem)] flex flex-col justify-between transition-transform duration-[1050ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform ${
          phase === "opening" ? "-translate-y-full" : "translate-y-0"
        }`}
        style={{
          backgroundColor: "#161616",
          backgroundImage: `
            repeating-linear-gradient(
              to bottom,
              #1e1e1e 0px,
              #2a2a2a 6px,
              #141414 14px,
              #0a0a0a 22px,
              #1e1e1e 28px
            )
          `,
        }}
      >
        {/* Side Metal Guide Tracks */}
        <div className="absolute inset-y-0 left-0 w-3 sm:w-5 bg-gradient-to-r from-black via-neutral-800 to-transparent border-r border-white/10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-3 sm:w-5 bg-gradient-to-l from-black via-neutral-800 to-transparent border-l border-white/10 pointer-events-none" />

        {/* Subtle Grime / Street Texture Overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.12), transparent 65%)",
          }}
        />

        {/* Top Stencil Metadata */}
        <div className="relative z-10 pt-8 px-6 flex items-center justify-between max-w-5xl mx-auto w-full font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase text-neutral-400">
          <span>BAY 01 // ARCHIVE BALE</span>
          <span>1-OF-1 STREETWEAR</span>
        </div>

        {/* Center Stenciled / Graffiti Poster on the Roll-Up Shutter */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center my-auto">
          <div className="bg-[#FAF9F5] border-4 border-ink p-4 sm:p-6 shadow-[8px_8px_0px_0px_#000000] max-w-[260px] sm:max-w-[340px] w-full transform -rotate-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="ReGear Thrift Shop"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 bg-black/90 border border-white/20 text-canvas px-4 py-1.5 font-mono text-xs uppercase tracking-[0.22em]">
            <LockOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {phase === "opening"
                ? "ROLLING UP SHUTTER..."
                : `UNLOCKING ARCHIVE ${progress}%`}
            </span>
          </div>
        </div>

        {/* Heavy Steel Bottom Bar + Pull Handle + Hazard Strip */}
        <div className="relative z-10 w-full">
          {/* Industrial Pull Handle Box */}
          <div className="flex flex-col items-center pb-4">
            <div className="inline-flex items-center gap-2 text-neutral-300 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-2 animate-bounce">
              <ChevronUp className="w-4 h-4" />
              <span>TAP TO ROLL UP</span>
              <ChevronUp className="w-4 h-4" />
            </div>
            {/* Metal Handle Bar */}
            <div className="w-36 sm:w-48 h-3 bg-gradient-to-b from-neutral-300 to-neutral-600 border-2 border-black rounded-xs shadow-lg" />
          </div>

          {/* Bottom Heavy Iron Beam */}
          <div className="h-8 sm:h-10 w-full bg-[#0B0B0B] border-t-2 border-neutral-600 flex items-center justify-between px-4 sm:px-8 shadow-[0_12px_30px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-500 border border-black" />
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-500 border border-black" />
            </div>
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-neutral-400">
              REGEAR THRIFT // CURATED BALE
            </span>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-500 border border-black" />
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-500 border border-black" />
            </div>
          </div>

          {/* Rubber Weather Seal */}
          <div className="h-2 w-full bg-black" />
        </div>
      </div>
    </div>
  );
}
