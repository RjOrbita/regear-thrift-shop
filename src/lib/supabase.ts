import { createClient } from "@supabase/supabase-js";
import { Product, ProductInput, ProductStatus } from "@/types/product";
import { SEED_PRODUCTS } from "@/lib/seed-data";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://kdpontrsjvsllodehzxm.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_1LFkdmff0QJX_WWGrreBrA_Q8XioGM-";

export const supabase = createClient(supabaseUrl, supabaseKey);

const LOCAL_STORAGE_KEY = "regear_fallback_products_v1";

function getLocalFallback(): Product[] {
  if (typeof window === "undefined") return SEED_PRODUCTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
      return SEED_PRODUCTS;
    }
    return JSON.parse(raw) as Product[];
  } catch {
    return SEED_PRODUCTS;
  }
}

function saveLocalFallback(items: Product[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage quota errors
  }
}

export async function fetchProducts(): Promise<{
  products: Product[];
  isLiveSupabase: boolean;
}> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      saveLocalFallback(data as Product[]);
      return { products: data as Product[], isLiveSupabase: true };
    }
    return { products: getLocalFallback(), isLiveSupabase: true };
  } catch {
    return { products: getLocalFallback(), isLiveSupabase: false };
  }
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert([input])
    .select("*")
    .single();

  if (error || !data) {
    const fallbackItem: Product = {
      ...input,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const current = getLocalFallback();
    saveLocalFallback([fallbackItem, ...current]);
    return fallbackItem;
  }

  return data as Product;
}

export async function updateProduct(
  id: string,
  updates: Partial<ProductInput>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    const current = getLocalFallback();
    const updated = current.map((p) =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    saveLocalFallback(updated);
    return updated.find((p) => p.id === id) as Product;
  }

  return data as Product;
}

export async function updateProductStatus(
  id: string,
  status: ProductStatus
): Promise<Product> {
  return updateProduct(id, { status });
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    const current = getLocalFallback().filter((p) => p.id !== id);
    saveLocalFallback(current);
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `items/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    // Fallback to Data URL if offline
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
