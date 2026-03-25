"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getPanier } from "@/lib/api/client";
import { getAuthSession } from "@/lib/api/session";

const CART_COUNT_KEY = "toni360.cart.count";

interface CartContextValue {
  cartCount: number;
  refreshCart: () => void;
  updateCount: (count: number) => void;
  clearLocalCart: () => void;
}

const CartContext = createContext<CartContextValue>({
  cartCount: 0,
  refreshCart: () => {},
  updateCount: () => {},
  clearLocalCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem(CART_COUNT_KEY);
    return stored ? Number(stored) : 0;
  });

  const applyCount = useCallback((count: number) => {
    setCartCount(count);
    localStorage.setItem(CART_COUNT_KEY, String(count));
  }, []);

  const fetchCartCount = useCallback(async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "patient") return;
    try {
      const response = await getPanier(session.token);
      const count = response.data.panier.pharmacies.reduce(
        (sum, pharmacie) =>
          sum + pharmacie.produits.reduce((s, p) => s + p.quantite, 0),
        0,
      );
      applyCount(count);
    } catch {
      // Keep local value on network error
    }
  }, [applyCount]);

  const refreshCart = useCallback(() => {
    void fetchCartCount();
  }, [fetchCartCount]);

  const updateCount = useCallback((count: number) => {
    applyCount(count);
  }, [applyCount]);

  const clearLocalCart = useCallback(() => {
    setCartCount(0);
    localStorage.removeItem(CART_COUNT_KEY);
  }, []);

  // Initial sync — run once on mount
  useEffect(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "patient") return;
    let cancelled = false;
    getPanier(session.token)
      .then((response) => {
        if (cancelled) return;
        const count = response.data.panier.pharmacies.reduce(
          (sum, pharmacie) =>
            sum + pharmacie.produits.reduce((s, p) => s + p.quantite, 0),
          0,
        );
        setCartCount(count);
        localStorage.setItem(CART_COUNT_KEY, String(count));
      })
      .catch(() => { /* keep local */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, updateCount, clearLocalCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
