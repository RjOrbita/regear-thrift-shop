"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Upload,
  Trash2,
  Edit3,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Image as ImageIcon,
  RefreshCw,
  X,
  Sparkles,
  Lock,
  LogOut,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import {
  Product,
  ProductCategory,
  ProductInput,
  ProductStatus,
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES,
} from "@/types/product";
import { useShop, formatPHP } from "@/context/ShopContext";
import { uploadProductImage, supabase } from "@/lib/supabase";

const CONDITION_PRESETS = [
  "10/10 Deadstock",
  "9.5/10 Near Mint",
  "9/10 Mint Vintage",
  "9/10 Cracked Plastisol",
  "8.5/10 Thrashed & Faded",
  "8/10 Distressed Workwear",
];

export default function AdminDashboardPage() {
  const {
    products,
    loading,
    isLiveSupabase,
    refreshProducts,
    addNewProduct,
    editProduct,
    setItemStatus,
    removeProduct,
  } = useShop();

  // Server-Verified Supabase Auth State (No client-side hardcoded passwords)
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        const isAdmin =
          session?.user?.app_metadata?.role === "regear_admin";
        setIsUnlocked(Boolean(session && isAdmin));
        setAdminEmail(session?.user?.email || null);
        setCheckingAuth(false);
      }
    }

    verifySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const isAdmin =
        session?.user?.app_metadata?.role === "regear_admin";
      setIsUnlocked(Boolean(session && isAdmin));
      setAdminEmail(session?.user?.email || null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoggingIn(true);

    try {
      const rawIdentifier = username.trim().toLowerCase();
      // Map shorthand "admin" to the Supabase Auth email "admin@regear.shop"
      const resolvedEmail = rawIdentifier.includes("@")
        ? rawIdentifier
        : `${rawIdentifier}@regear.shop`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: password,
      });

      if (error || !data.session) {
        setAuthError("INVALID CREDENTIALS. ACCESS DENIED.");
        return;
      }

      if (data.session.user.app_metadata?.role !== "regear_admin") {
        await supabase.auth.signOut();
        setAuthError("UNAUTHORIZED ACCOUNT: MISSING ADMIN ROLE CLAIM.");
        return;
      }

      setIsUnlocked(true);
      setAdminEmail(data.session.user.email || resolvedEmail);
      setPassword("");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLockAdmin = async () => {
    await supabase.auth.signOut();
    setIsUnlocked(false);
    setAdminEmail(null);
  };

  const nextSkuNumber = String(products.length + 1).padStart(3, "0");

  const [form, setForm] = useState<ProductInput>({
    sku: `RG-${nextSkuNumber}`,
    title: "",
    category: "Tees",
    price_php: 850,
    size: "L",
    fit_notes: "",
    condition_rating: "9/10 Mint Vintage",
    condition_notes: "",
    status: "available",
    images: [],
    era: "90s / Y2K Archive",
    featured: false,
  });

  const openCreateModal = () => {
    const nextNum = String(products.length + 1).padStart(3, "0");
    setEditingId(null);
    setForm({
      sku: `RG-${nextNum}`,
      title: "",
      category: "Tees",
      price_php: 850,
      size: "L",
      fit_notes: "",
      condition_rating: "9/10 Mint Vintage",
      condition_notes: "",
      status: "available",
      images: [],
      era: "90s / Y2K Archive",
      featured: false,
    });
    setImageUrlInput("");
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      title: product.title,
      category: product.category,
      price_php: product.price_php,
      size: product.size,
      fit_notes: product.fit_notes || "",
      condition_rating: product.condition_rating,
      condition_notes: product.condition_notes || "",
      status: product.status,
      images: product.images || [],
      era: product.era || "90s / Y2K Archive",
      featured: Boolean(product.featured),
    });
    setImageUrlInput("");
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const publicUrl = await uploadProductImage(file);
        uploadedUrls.push(publicUrl);
      }
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } finally {
      setUploadingFiles(false);
      e.target.value = "";
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, trimmed],
    }));
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    try {
      const finalImages =
        form.images.length > 0
          ? form.images
          : [
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85",
            ];

      const payload: ProductInput = {
        ...form,
        price_php: Number(form.price_php) || 0,
        images: finalImages,
      };

      if (editingId) {
        await editProduct(editingId, payload);
      } else {
        await addNewProduct(payload);
      }
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return null;
  }

  // SUPABASE AUTH ADMIN LOGIN GATE
  if (!isUnlocked) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-canvas">
        <div className="w-full max-w-md bg-surface border-2 border-ink shadow-[8px_8px_0px_0px_#0D0D0D] overflow-hidden">
          <div className="px-6 py-4 bg-ink text-canvas flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em]">
            <span className="inline-flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>REGEAR BACKROOM // SUPABASE AUTH</span>
            </span>
            <Link href="/" className="text-neutral-300 hover:text-canvas">
              EXIT
            </Link>
          </div>

          <form onSubmit={handleAdminLogin} className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-ink/15">
              <div className="w-24 bg-[#FAF9F5] border border-ink p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.jpg"
                  alt="ReGear Logo"
                  className="w-full h-auto object-contain"
                />
              </div>
              <div>
                <h1 className="font-display text-xl font-black uppercase text-ink">
                  STAFF ACCESS
                </h1>
                <p className="font-mono text-[11px] text-ash">
                  Protected by Supabase JWT &amp; PostgreSQL RLS.
                </p>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-100 border border-red-700 font-mono text-xs text-red-900 font-bold">
                {authError}
              </div>
            )}

            <div>
              <label className="block font-mono text-[11px] uppercase font-bold text-ink mb-1.5">
                ADMIN USERNAME / EMAIL
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-3 bg-canvas border border-ink font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase font-bold text-ink mb-1.5">
                PASSWORD
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-3 bg-canvas border border-ink font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-4 bg-ink text-canvas font-mono text-xs font-extrabold uppercase tracking-[0.18em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#5A5A55]"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loggingIn ? "VERIFYING JWT..." : "UNLOCK INVENTORY →"}</span>
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="font-mono text-[11px] uppercase text-ash hover:text-ink underline"
              >
                ← Return to Storefront
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const visibleProducts = products.filter((p) =>
    statusFilter === "all" ? true : p.status === statusFilter
  );

  const countAvailable = products.filter((p) => p.status === "available").length;
  const countReserved = products.filter((p) => p.status === "reserved").length;
  const countSold = products.filter((p) => p.status === "sold").length;

  return (
    <div className="max-w-[1440px] mx-auto border-x border-b border-ink bg-canvas min-h-screen">
      {/* Top Admin Header */}
      <div className="p-5 sm:p-8 bg-ink text-canvas border-b border-ink flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-canvas underline underline-offset-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>STOREFRONT</span>
            </Link>
            <span>•</span>
            <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isLiveSupabase
                ? `RLS VERIFIED (${adminEmail || "ADMIN"})`
                : "LOCAL CACHE"}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight">
            REGEAR INVENTORY MANAGER
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openCreateModal}
            className="flex-1 sm:flex-initial px-5 py-3 bg-canvas text-ink font-mono text-xs font-extrabold uppercase tracking-[0.15em] hover:bg-neutral-200 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>ADD 1-OF-1 PIECE</span>
          </button>

          <button
            type="button"
            onClick={refreshProducts}
            className="px-3.5 py-3 border border-canvas/40 text-canvas font-mono text-xs uppercase hover:bg-white/10 transition-colors inline-flex items-center gap-1.5"
            title="Sync Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">SYNC</span>
          </button>

          <button
            type="button"
            onClick={handleLockAdmin}
            className="px-3.5 py-3 border border-red-400/50 text-red-300 font-mono text-xs uppercase hover:bg-red-950/50 transition-colors inline-flex items-center gap-1.5"
            title="Sign Out & Lock Admin Panel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOCK</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Filter Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-x divide-ink border-b border-ink bg-surface font-mono">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`p-4 sm:p-5 text-left transition-colors ${
            statusFilter === "all" ? "bg-canvas font-bold" : "hover:bg-canvas/50"
          }`}
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-ash block">
            ALL PIECES
          </span>
          <span className="text-2xl sm:text-3xl font-black text-ink mt-1 block">
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("available")}
          className={`p-4 sm:p-5 text-left transition-colors ${
            statusFilter === "available"
              ? "bg-emerald-50 font-bold"
              : "hover:bg-canvas/50"
          }`}
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-emerald-700 font-bold block">
            ● AVAILABLE
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1 block">
            {countAvailable}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("reserved")}
          className={`p-4 sm:p-5 text-left transition-colors ${
            statusFilter === "reserved"
              ? "bg-amber-50 font-bold"
              : "hover:bg-canvas/50"
          }`}
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-amber-700 font-bold block">
            ◐ RESERVED
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-800 mt-1 block">
            {countReserved}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("sold")}
          className={`p-4 sm:p-5 text-left transition-colors ${
            statusFilter === "sold"
              ? "bg-neutral-200 font-bold"
              : "hover:bg-canvas/50"
          }`}
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-ash font-bold block">
            ✕ SOLD OUT
          </span>
          <span className="text-2xl sm:text-3xl font-black text-ink mt-1 block">
            {countSold}
          </span>
        </button>
      </div>

      {/* Inventory List */}
      <div className="divide-y divide-ink bg-surface">
        {visibleProducts.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:bg-canvas/40 transition-colors"
          >
            {/* Thumbnail + Title + Specs (6 cols) */}
            <div className="lg:col-span-6 flex items-start sm:items-center gap-3.5">
              <div className="relative h-20 w-16 sm:h-24 sm:w-20 border border-ink bg-neutral-100 shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0 right-0 bg-ink text-canvas font-mono text-[9px] px-1 py-0.5">
                  {item.images.length} IMG
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                  <span className="bg-ink text-canvas px-1.5 py-0.5 font-bold">
                    {item.sku}
                  </span>
                  <span className="border border-ink px-1.5 py-0.5 font-bold">
                    SIZE {item.size}
                  </span>
                  <span className="text-ash uppercase">{item.category}</span>
                  {item.featured && (
                    <span className="bg-amber-200 text-ink px-1.5 py-0.5 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      SPOTLIGHT
                    </span>
                  )}
                </div>

                <h3 className="font-display text-base sm:text-lg font-extrabold uppercase text-ink truncate">
                  {item.title}
                </h3>

                <p className="font-mono text-xs text-ash truncate">
                  {item.condition_rating} • {formatPHP(item.price_php)}
                </p>
              </div>
            </div>

            {/* Price on Desktop (2 cols) */}
            <div className="hidden lg:block lg:col-span-2 font-mono">
              <span className="text-[10px] uppercase text-ash block">
                PRICE (PHP)
              </span>
              <span className="text-xl font-black text-ink">
                {formatPHP(item.price_php)}
              </span>
            </div>

            {/* 1-Click Status Switcher (3 cols) */}
            <div className="lg:col-span-3 flex items-center gap-1.5 font-mono text-[11px] uppercase">
              <button
                type="button"
                onClick={() => setItemStatus(item.id, "available")}
                className={`flex-1 py-2.5 px-2 border transition-all flex items-center justify-center gap-1 ${
                  item.status === "available"
                    ? "bg-emerald-700 text-canvas border-ink font-bold"
                    : "bg-canvas text-ash border-ink/30"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AVAIL</span>
              </button>

              <button
                type="button"
                onClick={() => setItemStatus(item.id, "reserved")}
                className={`flex-1 py-2.5 px-2 border transition-all flex items-center justify-center gap-1 ${
                  item.status === "reserved"
                    ? "bg-amber-500 text-ink border-ink font-bold"
                    : "bg-canvas text-ash border-ink/30"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>HOLD</span>
              </button>

              <button
                type="button"
                onClick={() => setItemStatus(item.id, "sold")}
                className={`flex-1 py-2.5 px-2 border transition-all flex items-center justify-center gap-1 ${
                  item.status === "sold"
                    ? "bg-ink text-canvas border-ink font-bold"
                    : "bg-canvas text-ash border-ink/30"
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>SOLD</span>
              </button>
            </div>

            {/* Edit & Delete Actions (1 col) */}
            <div className="lg:col-span-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => openEditModal(item)}
                className="p-2.5 border border-ink bg-canvas hover:bg-ink hover:text-canvas transition-colors"
                title="Edit Piece"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => removeProduct(item.id)}
                className="p-2.5 border border-ink bg-canvas text-red-700 hover:bg-red-700 hover:text-canvas transition-colors"
                title="Delete Piece"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-canvas border-2 border-ink shadow-[8px_8px_0px_0px_#0D0D0D] my-auto overflow-hidden">
            <div className="px-5 py-4 bg-ink text-canvas flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em]">
              <span>
                {editingId
                  ? `// EDIT PIECE [${form.sku}]`
                  : `// UPLOAD NEW 1-OF-1 PIECE`}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="hover:text-neutral-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold mb-1">
                    SKU CODE *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface border border-ink font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold mb-1">
                    CATEGORY *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-surface border border-ink font-mono text-xs"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold mb-1">
                    PRICE IN PHP (₱) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.price_php}
                    onChange={(e) =>
                      setForm({ ...form, price_php: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-surface border border-ink font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase font-bold mb-1">
                    GARMENT TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Vintage 90s Harley Heavyweight Faded Tee"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-surface border border-ink font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold mb-1">
                    ERA / TAGLINE
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 90s JDM Archive"
                    value={form.era}
                    onChange={(e) => setForm({ ...form, era: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface border border-ink font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface border border-ink p-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold mb-1.5">
                    SHIRT / APPAREL SIZE *
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PRODUCT_SIZES.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setForm({ ...form, size: sz })}
                        className={`px-3 py-1 font-mono text-xs font-bold border ${
                          form.size === sz
                            ? "bg-ink text-canvas border-ink"
                            : "bg-canvas text-ink border-ink/30"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    placeholder="Or custom (e.g. L/XL, W32)"
                    className="w-full px-3 py-1.5 bg-canvas border border-ink font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase font-bold mb-1.5">
                    FIT &amp; DIMENSIONS NOTE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder='e.g., Boxy oversized fit • Pit-to-pit: 24" • Length: 28"'
                    value={form.fit_notes}
                    onChange={(e) =>
                      setForm({ ...form, fit_notes: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-canvas border border-ink font-mono text-xs"
                  />
                </div>
              </div>

              <div className="bg-surface border border-ink p-4 space-y-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold mb-1.5">
                    CONDITION RATING *
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {CONDITION_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, condition_rating: preset })
                        }
                        className={`px-2.5 py-1 font-mono text-[11px] border ${
                          form.condition_rating === preset
                            ? "bg-ink text-canvas border-ink font-bold"
                            : "bg-canvas text-ink border-ink/30"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    required
                    value={form.condition_rating}
                    onChange={(e) =>
                      setForm({ ...form, condition_rating: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-canvas border border-ink font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold mb-1">
                    CONDITION &amp; FLAW DISCLOSURE NOTES
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe fabric weight, wash/fade, or any minor vintage flaws..."
                    value={form.condition_notes}
                    onChange={(e) =>
                      setForm({ ...form, condition_notes: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-canvas border border-ink font-mono text-xs"
                  />
                </div>
              </div>

              <div className="bg-surface border border-ink p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-mono text-[11px] uppercase font-bold">
                      MULTIPLE PRODUCT IMAGES (FRONT, BACK, TAG, DETAILS)
                    </label>
                    <p className="font-mono text-[10px] text-ash">
                      Image #1 is cover; Image #2 flips on hover.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-canvas font-mono text-xs font-bold uppercase cursor-pointer hover:bg-neutral-800 transition-colors self-start">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadingFiles ? "UPLOADING..." : "UPLOAD PHOTOS"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploadingFiles}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Or paste an image URL (https://...)"
                    className="flex-1 px-3.5 py-2 bg-canvas border border-ink font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 border border-ink bg-canvas font-mono text-xs font-bold uppercase hover:bg-ink hover:text-canvas transition-colors inline-flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>ADD URL</span>
                  </button>
                </div>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {form.images.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square border border-ink bg-neutral-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 bg-ink text-canvas font-mono text-[9px] px-1.5 py-0.5">
                          {idx === 0
                            ? "COVER"
                            : idx === 1
                            ? "HOVER"
                            : `#${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                    className="h-4 w-4 accent-ink"
                  />
                  <span>FEATURE IN HERO SPOTLIGHT</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-3 border border-ink font-mono text-xs font-bold uppercase"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-ink text-canvas font-mono text-xs font-extrabold uppercase tracking-[0.16em]"
                  >
                    {submitting
                      ? "SAVING..."
                      : editingId
                      ? "SAVE CHANGES"
                      : "PUBLISH PIECE"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
