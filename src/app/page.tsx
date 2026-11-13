"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MessageCircle,
  ArrowUpRight,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import ShopMapSection from "@/components/ShopMapSection";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES,
  ProductCategory,
} from "@/types/product";
import { useShop, formatPHP, FB_PROFILE_URL } from "@/context/ShopContext";

export default function HomePage() {
  const router = useRouter();
  const {
    products,
    filteredProducts,
    loading,
    selectedCategory,
    setSelectedCategory,
    selectedSize,
    setSelectedSize,
    searchQuery,
    setSearchQuery,
    hideUnavailable,
    setHideUnavailable,
    bag,
    setIsBagOpen,
  } = useShop();

  // Hidden Admin Trigger: 3 rapid taps on the Footer Logo or Shift+Alt+A on keyboard
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSecretLogoTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      router.push("/admin");
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1200);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        router.push("/admin");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const categories: ("All" | ProductCategory)[] = [
    "All",
    ...PRODUCT_CATEGORIES,
  ];

  const sizes = ["All", ...PRODUCT_SIZES];

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedSize("All");
    setSearchQuery("");
    setHideUnavailable(false);
  };

  const bagTotal = bag.reduce((sum, item) => sum + item.price_php, 0);

  return (
    <div className="bg-canvas pb-20 sm:pb-0">
      {/* 1. Above-The-Fold Editorial Hero */}
      <Hero />

      {/* 2. Clean, Phone-First Catalog Section */}
      <section
        id="catalog"
        className="max-w-[1440px] mx-auto border-x border-ink"
      >
        {/* Sticky Mobile-Friendly Filter Bar */}
        <div className="bg-surface border-b border-ink">
          {/* Row 1: Scrollable Category Pills */}
          <div className="flex items-center overflow-x-auto no-scrollbar divide-x divide-ink border-b border-ink">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 sm:px-6 py-3 font-mono text-[11px] sm:text-xs uppercase tracking-[0.14em] whitespace-nowrap transition-colors ${
                    active
                      ? "bg-ink text-canvas font-bold"
                      : "bg-surface text-ink hover:bg-canvas"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Row 2: Compact Size Pills + Search + Available Toggle */}
          <div className="p-3 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-canvas/60">
            {/* Size Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ash mr-1 shrink-0">
                SIZE:
              </span>
              {sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2.5 py-1 font-mono text-[11px] uppercase border transition-colors shrink-0 ${
                    selectedSize === sz
                      ? "bg-ink text-canvas border-ink font-bold"
                      : "bg-surface text-ink border-ink/30"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Search & Available Only */}
            <div className="flex items-center gap-3">
              <div className="flex-1 sm:w-56 flex items-center gap-2 px-3 py-1.5 bg-surface border border-ink">
                <Search className="w-3.5 h-3.5 text-ash shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item or SKU..."
                  className="w-full bg-transparent font-mono text-xs text-ink placeholder:text-ash focus:outline-none"
                />
              </div>

              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none font-mono text-[11px] uppercase tracking-wider text-ink shrink-0">
                <input
                  type="checkbox"
                  checked={hideUnavailable}
                  onChange={(e) => setHideUnavailable(e.target.checked)}
                  className="h-3.5 w-3.5 accent-ink"
                />
                <span>AVAIL ONLY</span>
              </label>

              {(selectedCategory !== "All" ||
                selectedSize !== "All" ||
                searchQuery !== "" ||
                hideUnavailable) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-ink underline shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Phone-Friendly 2-Column Product Grid (4 columns on desktop) */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 border-l border-ink">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="border-b border-r border-ink p-3 sm:p-4 space-y-3 animate-pulse bg-surface"
              >
                <div className="aspect-[4/5] bg-neutral-200 w-full" />
                <div className="h-4 bg-neutral-200 w-3/4" />
                <div className="h-4 bg-neutral-200 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 sm:p-16 text-center bg-surface border-b border-ink space-y-4">
            <p className="font-display text-xl sm:text-2xl font-black uppercase text-ink">
              NO PIECES MATCH YOUR FILTER
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-6 py-3 bg-ink text-canvas font-mono text-xs font-bold uppercase tracking-widest"
            >
              SHOW ALL PIECES
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 border-l border-ink">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Compact 3-Step "How To Claim" Strip */}
      <section
        id="how-to-buy"
        className="max-w-[1440px] mx-auto border-x border-b border-ink bg-ink text-canvas"
      >
        <div className="p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-canvas/20">
            <div>
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold">
                // DIRECT FACEBOOK CLAIM
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase mt-1">
                3 STEPS TO LOCK IN YOUR PIECE
              </h2>
            </div>
            <a
              href={FB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-canvas text-ink px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider self-start"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>MESSAGE US ON FB</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="border border-canvas/20 p-4 sm:p-5 bg-white/5">
              <span className="font-mono text-[11px] text-emerald-400 font-bold">
                01 // INSPECT
              </span>
              <h3 className="font-display text-base sm:text-lg font-extrabold uppercase mt-1">
                CHECK SIZE &amp; GRADE
              </h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Tap any piece to view front/back photos, shirt size, and honest
                vintage condition notes.
              </p>
            </div>

            <div className="border border-canvas/20 p-4 sm:p-5 bg-white/5">
              <span className="font-mono text-[11px] text-emerald-400 font-bold">
                02 // BAG &amp; COPY
              </span>
              <h3 className="font-display text-base sm:text-lg font-extrabold uppercase mt-1">
                GENERATE ORDER CODE
              </h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Add to your Bag and tap Checkout—your itemized PHP order receipt
                is copied automatically.
              </p>
            </div>

            <div className="border border-canvas/20 p-4 sm:p-5 bg-white/5">
              <span className="font-mono text-[11px] text-emerald-400 font-bold">
                03 // SEND ON FB
              </span>
              <h3 className="font-display text-base sm:text-lg font-extrabold uppercase mt-1">
                PASTE IN MESSENGER
              </h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Paste the summary in our Facebook chat to confirm availability
                and shipping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Physical Shop Location & Interactive Directions Map */}
      <ShopMapSection />

      {/* 6. Clean Footer (with Hidden 3-Tap Admin Trigger on the Logo) */}
      <footer className="max-w-[1440px] mx-auto border-x border-b border-ink bg-canvas px-5 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSecretLogoTap}
              className="h-10 w-24 bg-[#FAF9F5] border border-ink p-1 flex items-center justify-center select-none cursor-default"
              title="ReGear Thrift Shop"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="ReGear Thrift Shop"
                className="h-full w-full object-contain"
              />
            </button>
            <div className="font-mono text-[11px]">
              <p className="font-bold uppercase text-ink">
                REGEAR THRIFT SHOP // ARCHIVE
              </p>
              <p className="text-ash">ALL PIECES 1-OF-1 • PHP (₱)</p>
            </div>
          </div>

          <a
            href={FB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-wider underline hover:text-ash inline-flex items-center gap-1"
          >
            <span>OFFICIAL FACEBOOK PAGE</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </footer>

      {/* 6. Floating Bottom Bag Bar for Mobile Phones */}
      {bag.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden p-3 bg-canvas/95 backdrop-blur-md border-t-2 border-ink shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
          <button
            type="button"
            onClick={() => setIsBagOpen(true)}
            className="w-full py-3.5 px-4 bg-ink text-canvas font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between"
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>
                BAG [{bag.length}] • {formatPHP(bagTotal)}
              </span>
            </span>
            <span className="bg-canvas text-ink px-2.5 py-1 text-[10px] font-black">
              CHECKOUT ON FB →
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
