"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "./config";
import { useRouter, usePathname } from "next/navigation";
import { AppUser } from "@/types/user";

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  appUser: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Attempt to lock persistence
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const db = getFirestore();
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setAppUser({ uid: currentUser.uid, ...docSnap.data() } as AppUser);
          } else {
            console.warn("No user profile found for UID:", currentUser.uid);
            // Default to admin fallback if missing (or we can block them, but let's be safe for backwards comp)
            setAppUser({ uid: currentUser.uid, role: "admin", tenantId: currentUser.uid, email: currentUser.email || "", name: "Admin", createdAt: new Date().toISOString() });
          }
        } catch (err) {
          console.error("Failed to fetch user metadata", err);
        }
      } else {
        setAppUser(null);
      }
      
      setLoading(false);
      
      // Basic route protection
      if (!currentUser && pathname.startsWith("/dashboard")) {
        router.push("/login");
      }
      
      if (currentUser && pathname === "/login") {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const logout = async () => {
    await signOut(auth);
    setAppUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
