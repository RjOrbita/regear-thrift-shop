"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Ruler,
  ShieldAlert,
  ShoppingBag,
  MessageCircle,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useShop, formatPHP } from "@/context/ShopContext";

export default function ProductModal() {
  const {
    activeProduct,
    setActiveProduct,
    addToBag,
    isInBag,
    triggerDirectFacebookBuy,
  } = useShop();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    setSelectedImageIdx(0);
  }, [activeProduct]);

  if (!activeProduct) return null;

  const images =
    activeProduct.images && activeProduct.images.length > 0
      ? activeProduct.images
      : [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85",
        ];

  const inBag = isInBag(activeProduct.id);
  const isAvailable = activeProduct.status === "available";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-canvas border-2 border-ink shadow-[8px_8px_0px_0px_#0D0D0D] overflow-hidden my-auto">
        {/* Top Modal Technical Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-ink text-canvas font-mono text-xs uppercase tracking-[0.18em]">
          <div className="flex items-center gap-3">
            <span>// ARCHIVE INSPECTION</span>
            <span className="text-emerald-400 font-bold">
              [{activeProduct.sku}]
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveProduct(null)}
            className="inline-flex items-center gap-1.5 text-canvas hover:text-neutral-300 font-bold"
          >
            <span>CLOSE [ESC]</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left: Multi-Angle Image Gallery (7 cols) */}
          <div className="lg:col-span-7 bg-surface border-b lg:border-b-0 lg:border-r border-ink p-4 sm:p-6 flex flex-col justify-between">
            <div className="relative aspect-[4/4] w-full bg-neutral-100 border border-ink overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[selectedImageIdx]}
                alt={`${activeProduct.title} - View ${selectedImageIdx + 1}`}
                className="w-full h-full object-cover object-center"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImageIdx((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-canvas/90 border border-ink p-2 hover:bg-ink hover:text-canvas transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImageIdx((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-canvas/90 border border-ink p-2 hover:bg-ink hover:text-canvas transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 right-3 bg-ink text-canvas font-mono text-[11px] uppercase px-2.5 py-1">
                ANGLE {selectedImageIdx + 1} OF {images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative h-20 w-20 shrink-0 border-2 overflow-hidden transition-all ${
                      selectedImageIdx === idx
                        ? "border-ink ring-2 ring-ink/30"
                        : "border-ink/30 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Garment Specs, Size, Condition & Claim Actions (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-canvas">
            <div className="space-y-5">
              {/* Category + Status */}
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider">
                <span className="text-ash">
                  {activeProduct.category} // {activeProduct.era || "ARCHIVE"}
                </span>
                {activeProduct.status === "available" && (
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-700 px-2.5 py-0.5 font-bold">
                    ● 1 OF 1 AVAILABLE
                  </span>
                )}
                {activeProduct.status === "reserved" && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-700 px-2.5 py-0.5 font-bold">
                    RESERVED
                  </span>
                )}
                {activeProduct.status === "sold" && (
                  <span className="bg-ink text-canvas px-2.5 py-0.5 font-bold">
                    SOLD OUT
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-black uppercase leading-tight text-ink">
                  {activeProduct.title}
                </h2>
                <p className="font-mono text-3xl font-black text-ink mt-2">
                  {formatPHP(activeProduct.price_php)}
                </p>
              </div>

              {/* Size & Fit Spec Box */}
              <div className="bg-surface border border-ink p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-ink/15 pb-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-ash flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-ink" />
                    TAG / FIT SIZE
                  </span>
                  <span className="font-mono text-sm font-black bg-ink text-canvas px-3 py-0.5">
                    SIZE {activeProduct.size}
                  </span>
                </div>
                <p className="font-mono text-xs text-ink pt-1">
                  {activeProduct.fit_notes ||
                    "Standard vintage fit • Message us on Facebook if you need extra measurements."}
                </p>
              </div>

              {/* Condition & Flaw Notes Disclosure Box */}
              <div className="bg-surface border border-ink p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-ink/15 pb-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-ash flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-ink" />
                    CONDITION GRADE
                  </span>
                  <span className="font-mono text-xs font-bold uppercase bg-canvas border border-ink px-2.5 py-0.5 text-ink">
                    {activeProduct.condition_rating}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-ink leading-relaxed pt-1">
                  {activeProduct.condition_notes ||
                    "Gently pre-owned vintage condition. No major flaws noted."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-ink">
              {isAvailable ? (
                <>
                  <button
                    type="button"
                    onClick={() => triggerDirectFacebookBuy(activeProduct)}
                    className="w-full py-4 px-5 bg-ink text-canvas font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.18em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#5A5A55]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>CLAIM THIS PIECE ON FACEBOOK →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addToBag(activeProduct)}
                    className={`w-full py-3.5 px-5 border border-ink font-mono text-xs font-bold uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 ${
                      inBag
                        ? "bg-emerald-700 text-canvas border-emerald-700"
                        : "bg-surface text-ink hover:bg-ink hover:text-canvas"
                    }`}
                  >
                    {inBag ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>ADDED TO YOUR 1-OF-1 BAG</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>ADD TO BAG (COMBINE MULTIPLE PIECES)</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="p-4 bg-neutral-200 border border-ink text-center font-mono text-xs uppercase tracking-wider text-ink">
                  THIS 1-OF-1 PIECE IS CURRENTLY{" "}
                  <strong>{activeProduct.status.toUpperCase()}</strong>.
                </div>
              )}

              <p className="font-mono text-[11px] text-center text-ash">
                Clicking Claim generates an itemized order code & opens ReGear
                Facebook Messenger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
