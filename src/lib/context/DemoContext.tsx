"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  setIsDemoMode: () => {},
});

const DEMO_STORAGE_KEY = "sigorta_cuzdani_demo_mode";

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoModeState] = useState(false);

  // localStorage'dan ilk değeri oku
  useEffect(() => {
    const saved = localStorage.getItem(DEMO_STORAGE_KEY);
    if (saved === "true") setIsDemoModeState(true);
  }, []);

  const setIsDemoMode = (val: boolean) => {
    setIsDemoModeState(val);
    if (val) {
      localStorage.setItem(DEMO_STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, setIsDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => useContext(DemoContext);

