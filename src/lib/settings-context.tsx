"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { restaurant as defaultRestaurant } from "@/lib/constants";
import type { Restaurant } from "@/lib/types";

interface SettingsContextType {
  restaurantData: Restaurant;
  updateRestaurantData: (data: Partial<Restaurant>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [restaurantData, setRestaurantData] = useState<Restaurant>(defaultRestaurant);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("restaurantSettings");
    if (saved) {
      try {
        setRestaurantData(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const updateRestaurantData = (data: Partial<Restaurant>) => {
    setRestaurantData((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem("restaurantSettings", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ restaurantData, updateRestaurantData }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
