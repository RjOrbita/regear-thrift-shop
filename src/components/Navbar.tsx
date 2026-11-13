"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { useShop, FB_PROFILE_URL } from "@/context/ShopContext";

export default function Navbar() {
  const { bag, setIsBagOpen, products, setSelectedCategory } = useShop();

  const availableCount = products.filter(
    (p) => p.status === "available"
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-ink">
      {/* Minimal Streetwear Marquee Ticker */}
      <div className="bg-ink text-canvas overflow-hidden border-b border-ink py-1 select-none">
        <div className="flex whitespace-nowrap animate-marquee font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="mx-5 flex items-center gap-5">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                DROP 001 LIVE ({availableCount} AVAILABLE)
              </span>
              <span>•</span>
              <span>1-OF-1 CURATED THRIFT</span>
              <span>•</span>
              <span>CLAIM VIA FACEBOOK MESSENGER</span>
              <span>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Clean Mobile-First Header Bar */}
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => setSelectedCategory("All")}
          className="flex items-center gap-2.5 group"
        >
          <div className="h-9 w-22 sm:h-10 sm:w-28 bg-[#FAF9F5] border border-ink px-1.5 py-0.5 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="ReGear Thrift Shop"
              className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-ash">
            // 1-OF-1 ARCHIVE
          </span>
        </Link>

        {/* Center Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-[0.16em]">
          <Link
            href="/#catalog"
            onClick={() => setSelectedCategory("All")}
            className="text-ink font-bold hover:underline underline-offset-4"
          >
            Catalog ({products.length})
          </Link>
          <Link
            href="/#how-to-buy"
            className="text-ash hover:text-ink transition-colors"
          >
            How To Claim
          </Link>
          <Link
            href="/#shop-map"
            className="text-ash hover:text-ink transition-colors"
          >
            Shop Map
          </Link>
          <a
            href={FB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-ash hover:text-ink transition-colors"
          >
            <span>Facebook</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </nav>

        {/* Right Bag Button */}
        <button
          type="button"
          onClick={() => setIsBagOpen(true)}
          className="flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-ink text-canvas font-mono text-xs font-bold uppercase tracking-[0.14em] hover:bg-neutral-800 active:scale-95 transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>BAG [{bag.length}]</span>
        </button>
      </div>
    </header>
  );
}
