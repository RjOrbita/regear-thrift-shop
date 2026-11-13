"use client";

import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useShop, formatPHP } from "@/context/ShopContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToBag, isInBag, setActiveProduct } = useShop();
  const [hovered, setHovered] = useState(false);

  const primaryImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85";
  const secondaryImage = product.images?.[1] || primaryImage;
  const inBag = isInBag(product.id);
  const isAvailable = product.status === "available";
  const isReserved = product.status === "reserved";
  const isSold = product.status === "sold";

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group bg-surface border-b border-r border-ink flex flex-col justify-between"
    >
      {/* Clean Image Container */}
      <div
        onClick={() => setActiveProduct(product)}
        className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hovered ? secondaryImage : primaryImage}
          alt={product.title}
          className={`w-full h-full object-cover object-center transition-transform duration-500 ${
            hovered ? "scale-105" : "scale-100"
          } ${!isAvailable ? "grayscale opacity-70" : ""}`}
        />

        {/* Sold / Reserved Stamp */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-ink/30 flex items-center justify-center pointer-events-none">
            <span className="border border-canvas bg-ink/90 text-canvas font-mono text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-3 py-1.5 -rotate-6">
              {isSold ? "SOLD OUT" : "RESERVED"}
            </span>
          </div>
        )}

        {/* Top Row Badges: Size & Status */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          <span className="bg-ink text-canvas font-mono text-[10px] sm:text-xs font-extrabold uppercase px-2 py-0.5">
            {product.size}
          </span>

          {isAvailable && (
            <span className="bg-canvas/95 text-ink border border-ink font-mono text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5">
              {product.condition_rating.split(" ")[0]}
            </span>
          )}
          {isReserved && (
            <span className="bg-amber-300 text-ink border border-ink font-mono text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5">
              HOLD
            </span>
          )}
        </div>
      </div>

      {/* Minimal, Phone-Friendly Details Block */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between gap-2">
        <div onClick={() => setActiveProduct(product)} className="cursor-pointer">
          <span className="block font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-ash">
            {product.sku} • {product.category}
          </span>
          <h3 className="font-display text-xs sm:text-base font-extrabold uppercase leading-snug text-ink group-hover:underline line-clamp-2 mt-0.5">
            {product.title}
          </h3>
        </div>

        {/* Price + Single Clean Button */}
        <div className="pt-2 border-t border-ink/15 flex items-center justify-between gap-1.5">
          <span
            className={`font-mono text-sm sm:text-lg font-black ${
              isSold ? "line-through text-ash" : "text-ink"
            }`}
          >
            {formatPHP(product.price_php)}
          </span>

          {isAvailable ? (
            <button
              type="button"
              onClick={() => addToBag(product)}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1 ${
                inBag
                  ? "bg-emerald-700 text-canvas"
                  : "bg-ink text-canvas hover:bg-neutral-800 active:scale-95"
              }`}
            >
              {inBag ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>ADDED</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>BAG</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveProduct(product)}
              className="px-2 py-1 border border-ink/30 text-ash font-mono text-[10px] uppercase"
            >
              VIEW
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
