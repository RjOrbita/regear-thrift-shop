"use client";

import React from "react";
import { ArrowDownRight, MessageCircle } from "lucide-react";
import { useShop, formatPHP, FB_PROFILE_URL } from "@/context/ShopContext";

export default function Hero() {
  const { products, setActiveProduct } = useShop();

  const featuredProduct =
    products.find((p) => p.featured && p.status === "available") ||
    products.find((p) => p.status === "available") ||
    products[0];

  return (
    <section className="border-b border-ink bg-canvas">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Left Streetwear Editorial Column (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-ink flex flex-col justify-between gap-6">
          <div className="space-y-5">
            {/* Brand Logo + Clean Tag */}
            <div className="flex items-center gap-4">
              <div className="w-36 sm:w-44 bg-[#FAF9F5] border-2 border-ink p-2.5 shadow-[4px_4px_0px_0px_#0D0D0D]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.jpg"
                  alt="ReGear Thrift Shop Logo"
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-ash space-y-1">
                <span className="inline-block bg-ink text-canvas px-2 py-0.5 font-bold">
                  DROP 001
                </span>
                <p className="text-ink font-bold">CURATED THRIFT ARCHIVE</p>
                <p>NO RESTOCKS • 1 OF 1</p>
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl xl:text-6xl font-black uppercase leading-[0.96] tracking-tight text-ink">
              FRESH OFF THE RACK.{" "}
              <span className="bg-ink text-canvas px-2 inline-block">
                1-OF-1
              </span>{" "}
              STREET ROTATION.
            </h1>

            <p className="text-sm sm:text-base text-ash max-w-xl leading-relaxed">
              Hand-picked vintage tees, racing jackets, and heavyweight workwear.
              Tap any piece to inspect measurements and claim directly via
              Facebook Messenger.
            </p>
          </div>

          {/* Mobile-Friendly Action Buttons */}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-3 pt-2">
            <a
              href="#catalog"
              className="inline-flex items-center justify-center gap-2.5 bg-ink text-canvas px-6 py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.16em] shadow-[4px_4px_0px_0px_#5A5A55] active:translate-y-0.5 transition-all"
            >
              <span>BROWSE RACK ({products.length})</span>
              <ArrowDownRight className="w-4 h-4" />
            </a>

            <a
              href={FB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-surface text-ink border border-ink px-5 py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.14em] hover:bg-ink hover:text-canvas transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>FACEBOOK PAGE</span>
            </a>
          </div>
        </div>

        {/* Right Spotlight Card (5 cols) */}
        {featuredProduct && (
          <div
            onClick={() => setActiveProduct(featuredProduct)}
            className="lg:col-span-5 bg-surface flex flex-col justify-between relative group cursor-pointer"
          >
            <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:flex-1 overflow-hidden bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredProduct.images[0]}
                alt={featuredProduct.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] sm:text-[11px] uppercase">
                <span className="bg-canvas text-ink border border-ink px-2.5 py-1 font-bold">
                  SPOTLIGHT // {featuredProduct.sku}
                </span>
                <span className="bg-ink text-canvas px-2.5 py-1 font-bold">
                  SIZE {featuredProduct.size}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-canvas flex items-end justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold block mb-0.5">
                    ● {featuredProduct.condition_rating}
                  </span>
                  <h2 className="font-display text-lg sm:text-2xl font-extrabold uppercase leading-tight line-clamp-1">
                    {featuredProduct.title}
                  </h2>
                </div>
                <p className="font-mono text-xl sm:text-2xl font-black text-canvas shrink-0">
                  {formatPHP(featuredProduct.price_php)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
