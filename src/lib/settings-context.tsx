"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import type { Restaurant } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

interface SettingsContextType {
  restaurantData: Restaurant;
  updateRestaurantData: (data: Partial<Restaurant>) => Promise<void>;
  loading: boolean;
}

const defaultRestaurant: Restaurant = {
  id: "",
  name: "Loading...",
  currency: "Rs",
  taxRate: 5,
  address: "",
  phone: ""
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [restaurantData, setRestaurantData] = useState<Restaurant>(defaultRestaurant);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { currentUser } = useAuth();

  useEffect(() => {
    async function loadSettings() {
      if (!currentUser?.restaurant_id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data: restaurantDataRow, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("id", currentUser.restaurant_id)
          .single();

        const { error: settingsError } = await supabase
          .from("restaurant_settings")
          .select("*")
          .eq("restaurant_id", currentUser.restaurant_id)
          .single();

        if (restaurantError) {
          console.error("Failed to load settings:", restaurantError);
          return;
        }

        if (restaurantDataRow) {
          setRestaurantData({
            id: restaurantDataRow.id,
            name: restaurantDataRow.name,
            currency: restaurantDataRow.currency || "$",
            taxRate: Number(restaurantDataRow.tax_rate) || 0,
            address: restaurantDataRow.address || "",
            phone: restaurantDataRow.phone || ""
          });
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [supabase, currentUser]);

  const updateRestaurantData = useCallback(async (data: Partial<Restaurant>) => {
    if (!currentUser?.restaurant_id) return;
    
    // Optimistically update UI
    setRestaurantData((prev) => ({ ...prev, ...data }));

    const dbRestaurantData: Record<string, unknown> = {};
    if (data.name !== undefined) dbRestaurantData.name = data.name;
    if (data.address !== undefined) dbRestaurantData.address = data.address;
    if (data.phone !== undefined) dbRestaurantData.phone = data.phone;
    if (data.currency !== undefined) dbRestaurantData.currency = data.currency;
    if (data.taxRate !== undefined) dbRestaurantData.tax_rate = data.taxRate;

    try {
      if (Object.keys(dbRestaurantData).length > 0) {
        await supabase
          .from("restaurants")
          .update(dbRestaurantData)
          .eq("id", currentUser.restaurant_id);
      }
    } catch (err) {
      console.error("Error updating settings:", err);
    }
  }, [supabase, currentUser]);

  return (
    <SettingsContext.Provider value={{ restaurantData, updateRestaurantData, loading }}>
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
