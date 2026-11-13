"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  Product,
  ProductCategory,
  ProductInput,
  ProductStatus,
} from "@/types/product";
import {
  fetchProducts,
  createProduct as dbCreateProduct,
  updateProduct as dbUpdateProduct,
  updateProductStatus as dbUpdateStatus,
  deleteProduct as dbDeleteProduct,
} from "@/lib/supabase";
import { SEED_PRODUCTS } from "@/lib/seed-data";

export const FB_PROFILE_ID =
  process.env.NEXT_PUBLIC_FB_PROFILE_ID || "61573021226882";
export const FB_PROFILE_URL =
  process.env.NEXT_PUBLIC_FB_PROFILE_URL ||
  `https://www.facebook.com/profile.php?id=${FB_PROFILE_ID}`;
export const FB_MESSENGER_URL = `https://www.facebook.com/messages/t/${FB_PROFILE_ID}`;

interface ShopContextValue {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  isLiveSupabase: boolean;
  selectedCategory: "All" | ProductCategory;
  setSelectedCategory: (cat: "All" | ProductCategory) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  hideUnavailable: boolean;
  setHideUnavailable: (val: boolean) => void;
  bag: Product[];
  isBagOpen: boolean;
  setIsBagOpen: (open: boolean) => void;
  activeProduct: Product | null;
  setActiveProduct: (product: Product | null) => void;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;
  checkoutItems: Product[];
  orderRefCode: string;
  addToBag: (product: Product) => void;
  removeFromBag: (productId: string) => void;
  clearBag: () => void;
  isInBag: (productId: string) => boolean;
  triggerDirectFacebookBuy: (product: Product) => void;
  triggerBagFacebookCheckout: () => void;
  formatOrderReceipt: (items?: Product[], customNote?: string) => string;
  refreshProducts: () => Promise<void>;
  addNewProduct: (input: ProductInput) => Promise<Product>;
  editProduct: (id: string, updates: Partial<ProductInput>) => Promise<Product>;
  setItemStatus: (id: string, status: ProductStatus) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

const BAG_STORAGE_KEY = "regear_bag_v1";

export function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}

function createRefCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "RG-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(true);

  const [selectedCategory, setSelectedCategory] = useState<
    "All" | ProductCategory
  >("All");
  const [selectedSize, setSelectedSize] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hideUnavailable, setHideUnavailable] = useState<boolean>(false);

  const [bagIds, setBagIds] = useState<string[]>([]);
  const [isBagOpen, setIsBagOpen] = useState<boolean>(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutItems, setCheckoutItems] = useState<Product[]>([]);
  const [orderRefCode, setOrderRefCode] = useState<string>("RG-0001");

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    const { products: fetched, isLiveSupabase: live } = await fetchProducts();
    setProducts(fetched);
    setIsLiveSupabase(live);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshProducts();
    try {
      const savedBag = localStorage.getItem(BAG_STORAGE_KEY);
      if (savedBag) {
        setBagIds(JSON.parse(savedBag));
      }
    } catch {
      // ignore
    }
  }, [refreshProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bagIds));
    } catch {
      // ignore
    }
  }, [bagIds]);

  // Keep activeProduct synced if products list updates
  useEffect(() => {
    if (activeProduct) {
      const updated = products.find((p) => p.id === activeProduct.id);
      if (updated) setActiveProduct(updated);
    }
  }, [products, activeProduct]);

  const bag = useMemo(() => {
    return bagIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p && p.status === "available"));
  }, [bagIds, products]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      if (
        selectedSize !== "All" &&
        item.size.toUpperCase() !== selectedSize.toUpperCase()
      ) {
        return false;
      }
      if (hideUnavailable && item.status !== "available") {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSku = item.sku.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchEra = (item.era || "").toLowerCase().includes(q);
        if (!matchTitle && !matchSku && !matchCategory && !matchEra) {
          return false;
        }
      }
      return true;
    });
  }, [
    products,
    selectedCategory,
    selectedSize,
    hideUnavailable,
    searchQuery,
  ]);

  const isInBag = useCallback(
    (productId: string) => bagIds.includes(productId),
    [bagIds]
  );

  const addToBag = useCallback((product: Product) => {
    if (product.status !== "available") return;
    setBagIds((prev) =>
      prev.includes(product.id) ? prev : [...prev, product.id]
    );
    setIsBagOpen(true);
  }, []);

  const removeFromBag = useCallback((productId: string) => {
    setBagIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clearBag = useCallback(() => {
    setBagIds([]);
  }, []);

  const triggerDirectFacebookBuy = useCallback((product: Product) => {
    setOrderRefCode(createRefCode());
    setCheckoutItems([product]);
    setActiveProduct(null);
    setIsBagOpen(false);
    setCheckoutModalOpen(true);
  }, []);

  const triggerBagFacebookCheckout = useCallback(() => {
    if (bag.length === 0) return;
    setOrderRefCode(createRefCode());
    setCheckoutItems(bag);
    setIsBagOpen(false);
    setCheckoutModalOpen(true);
  }, [bag]);

  const formatOrderReceipt = useCallback(
    (items?: Product[], customNote?: string) => {
      const targetItems = items && items.length > 0 ? items : checkoutItems;
      const totalPhp = targetItems.reduce((sum, p) => sum + p.price_php, 0);
      const lines = targetItems.map(
        (item, idx) =>
          `${idx + 1}. [${item.sku}] ${item.title}\n   • Size: ${
            item.size
          } | Cond: ${item.condition_rating} | ${formatPHP(item.price_php)}`
      );

      return [
        `🛒 REGEAR THRIFT SHOP — ORDER INQUIRY [${orderRefCode}]`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ...lines,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `TOTAL (${targetItems.length} ${
          targetItems.length === 1 ? "PIECE" : "PIECES"
        }): ${formatPHP(totalPhp)}`,
        ...(customNote && customNote.trim()
          ? [`NOTE / LOCATION: ${customNote.trim()}`]
          : []),
        ``,
        `Yo ReGear! I'd like to claim ${
          targetItems.length === 1 ? "this 1-of-1 piece" : "these 1-of-1 pieces"
        }. Still available?`,
      ].join("\n");
    },
    [checkoutItems, orderRefCode]
  );

  const addNewProduct = useCallback(async (input: ProductInput) => {
    const created = await dbCreateProduct(input);
    setProducts((prev) => [created, ...prev]);
    return created;
  }, []);

  const editProduct = useCallback(
    async (id: string, updates: Partial<ProductInput>) => {
      const updated = await dbUpdateProduct(id, updates);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    []
  );

  const setItemStatus = useCallback(
    async (id: string, status: ProductStatus) => {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
      await dbUpdateStatus(id, status);
    },
    []
  );

  const removeProduct = useCallback(async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await dbDeleteProduct(id);
  }, []);

  return (
    <ShopContext.Provider
      value={{
        products,
        filteredProducts,
        loading,
        isLiveSupabase,
        selectedCategory,
        setSelectedCategory,
        selectedSize,
        setSelectedSize,
        searchQuery,
        setSearchQuery,
        hideUnavailable,
        setHideUnavailable,
        bag,
        isBagOpen,
        setIsBagOpen,
        activeProduct,
        setActiveProduct,
        checkoutModalOpen,
        setCheckoutModalOpen,
        checkoutItems,
        orderRefCode,
        addToBag,
        removeFromBag,
        clearBag,
        isInBag,
        triggerDirectFacebookBuy,
        triggerBagFacebookCheckout,
        formatOrderReceipt,
        refreshProducts,
        addNewProduct,
        editProduct,
        setItemStatus,
        removeProduct,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return ctx;
}
