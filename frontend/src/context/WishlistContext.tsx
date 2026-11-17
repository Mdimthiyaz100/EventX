import React, { createContext, useContext, useEffect, useState } from "react";

interface WishlistContextType {
  wishlist: string[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "eventx_user_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist", e);
    }
  }, [wishlist]);

  const isWishlisted = (id: string) => wishlist.includes(id);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
