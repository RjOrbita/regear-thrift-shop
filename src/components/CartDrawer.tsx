"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Trash2,
  ShoppingBag,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import {
  useShop,
  formatPHP,
  FB_PROFILE_URL,
  FB_MESSENGER_URL,
} from "@/context/ShopContext";

export default function CartDrawer() {
  const {
    bag,
    isBagOpen,
    setIsBagOpen,
    removeFromBag,
    clearBag,
    triggerBagFacebookCheckout,
    checkoutModalOpen,
    setCheckoutModalOpen,
    checkoutItems,
    orderRefCode,
    formatOrderReceipt,
  } = useShop();

  const [buyerNote, setBuyerNote] = useState("");
  const [copied, setCopied] = useState(false);

  const bagTotal = bag.reduce((sum, item) => sum + item.price_php, 0);
  const receiptText = formatOrderReceipt(checkoutItems, buyerNote);

  // Auto-copy receipt whenever the checkout modal opens
  useEffect(() => {
    if (checkoutModalOpen && checkoutItems.length > 0) {
      navigator.clipboard
        ?.writeText(formatOrderReceipt(checkoutItems, buyerNote))
        .then(() => {
          setCopied(true);
        })
        .catch(() => {
          // ignore if clipboard requires explicit click
        });
    } else {
      setCopied(false);
    }
  }, [checkoutModalOpen, checkoutItems, buyerNote, formatOrderReceipt]);

  const handleCopyAndOpenFacebook = async (targetUrl: string) => {
    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
    } catch {
      // ignore
    }
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* 1. SLIDE-OVER BAG DRAWER */}
      {isBagOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-canvas border-l-2 border-ink h-full flex flex-col justify-between shadow-2xl">
            {/* Drawer Header */}
            <div className="px-6 py-4 bg-ink text-canvas flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>YOUR 1-OF-1 BAG [{bag.length}]</span>
              </div>
              <button
                type="button"
                onClick={() => setIsBagOpen(false)}
                className="hover:text-neutral-300 inline-flex items-center gap-1"
              >
                <span>CLOSE</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bag Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-ink/20 p-6">
              {bag.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="w-14 h-14 border border-ink bg-surface flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-ash" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-lg font-bold uppercase text-ink">
                      YOUR BAG IS EMPTY
                    </p>
                    <p className="font-mono text-xs text-ash max-w-xs">
                      Every piece at ReGear is 1-of-1. Add your favorite archive
                      finds before someone else claims them.
                    </p>
                  </div>
                </div>
              ) : (
                bag.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-20 h-24 object-cover border border-ink bg-neutral-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between font-mono text-[10px] text-ash uppercase">
                        <span>[{item.sku}]</span>
                        <span>
                          SIZE {item.size} • {item.condition_rating}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-bold uppercase text-ink truncate mt-0.5">
                        {item.title}
                      </h4>
                      <p className="font-mono text-base font-black text-ink mt-1">
                        {formatPHP(item.price_php)}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeFromBag(item.id)}
                        className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-red-700 hover:underline"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>REMOVE</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {bag.length > 0 && (
              <div className="p-6 bg-surface border-t-2 border-ink space-y-4">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-xs uppercase tracking-widest text-ash">
                    ESTIMATED TOTAL ({bag.length}{" "}
                    {bag.length === 1 ? "ITEM" : "ITEMS"})
                  </span>
                  <span className="text-2xl font-black text-ink">
                    {formatPHP(bagTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={triggerBagFacebookCheckout}
                  className="w-full py-4 px-5 bg-ink text-canvas font-mono text-xs font-bold uppercase tracking-[0.18em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#5A5A55]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>CHECKOUT VIA FACEBOOK MESSENGER →</span>
                </button>

                <button
                  type="button"
                  onClick={clearBag}
                  className="w-full py-2 font-mono text-[11px] uppercase tracking-wider text-ash hover:text-ink text-center"
                >
                  CLEAR BAG
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FACEBOOK MESSENGER CHECKOUT MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-canvas border-2 border-ink shadow-[8px_8px_0px_0px_#0D0D0D] overflow-hidden my-auto">
            {/* Header */}
            <div className="px-6 py-4 bg-ink text-canvas flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>FACEBOOK MESSENGER CHECKOUT // [{orderRefCode}]</span>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="hover:text-neutral-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Step Guide Banner */}
              <div className="bg-surface border border-ink p-4 space-y-1.5">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                  HOW TO COMPLETE YOUR CLAIM IN 10 SECONDS:
                </p>
                <ol className="font-mono text-xs text-ash space-y-1 list-decimal list-inside">
                  <li>
                    Your itemized order summary below is{" "}
                    <strong className="text-ink">automatically copied</strong>.
                  </li>
                  <li>
                    Click{" "}
                    <strong className="text-ink">
                      &ldquo;Open ReGear Facebook &amp; Send Message&rdquo;
                    </strong>{" "}
                    below.
                  </li>
                  <li>
                    Paste (<kbd className="px-1 border border-ink">Ctrl+V</kbd>{" "}
                    / <kbd className="px-1 border border-ink">Paste</kbd>) into
                    the chat to lock in your 1-of-1 piece(s)!
                  </li>
                </ol>
              </div>

              {/* Optional Buyer Note / Location */}
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-ink font-bold mb-1.5">
                  OPTIONAL: YOUR CITY / SHIPPING LOCATION OR QUESTION
                </label>
                <input
                  type="text"
                  value={buyerNote}
                  onChange={(e) => setBuyerNote(e.target.value)}
                  placeholder="e.g., Quezon City / LBC or J&T shipping"
                  className="w-full px-3.5 py-2.5 bg-surface border border-ink font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              {/* Formatted Order Summary Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-ink">
                    ORDER SUMMARY MESSAGE (READY TO PASTE)
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(receiptText);
                      setCopied(true);
                    }}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase font-bold px-2.5 py-1 border border-ink bg-surface hover:bg-ink hover:text-canvas transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>COPIED TO CLIPBOARD!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY MESSAGE</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="w-full p-4 bg-ink text-canvas font-mono text-xs whitespace-pre-wrap leading-relaxed border border-ink max-h-52 overflow-y-auto">
                  {receiptText}
                </pre>
              </div>

              {/* Primary Facebook Redirect Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyAndOpenFacebook(FB_MESSENGER_URL)}
                  className="w-full py-4 px-5 bg-ink text-canvas font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.16em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#5A5A55]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>COPY & OPEN FACEBOOK MESSENGER CHAT →</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyAndOpenFacebook(FB_PROFILE_URL)}
                  className="w-full py-3 px-4 bg-surface text-ink border border-ink font-mono text-xs font-bold uppercase tracking-[0.14em] hover:bg-canvas transition-colors flex items-center justify-center gap-2"
                >
                  <span>OPEN REGEAR FACEBOOK PROFILE PAGE</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
