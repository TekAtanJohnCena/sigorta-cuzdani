"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "./config";
import { useRouter, usePathname } from "next/navigation";
import { AppUser } from "@/types/user";
import { checkTenantExpiry } from "./firestore";

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  expiredMessage: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  appUser: null,
  loading: true,
  expiredMessage: null,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiredMessage, setExpiredMessage] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const db = getFirestore();
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          let fetchedAppUser: AppUser;
          if (docSnap.exists()) {
            fetchedAppUser = { uid: currentUser.uid, ...docSnap.data() } as AppUser;
          } else {
            fetchedAppUser = {
              uid: currentUser.uid,
              role: "admin",
              tenantId: currentUser.uid,
              email: currentUser.email || "",
              name: "Admin",
              createdAt: new Date().toISOString()
            };
          }
          
          // Check tenant subscription expiry
          const expiryResult = await checkTenantExpiry(fetchedAppUser.tenantId);
          if (expiryResult.expired) {
            await signOut(auth);
            setUser(null);
            setAppUser(null);
            setExpiredMessage("Abonelik süreniz sona erdi. Yenileme için lütfen bizimle iletişime geçin: destek@sigortacuzdani.net");
            setLoading(false);
            router.push("/login");
            return;
          }
          
          setAppUser(fetchedAppUser);
          setExpiredMessage(null);
        } catch (err) {
          console.error("Failed to fetch user metadata", err);
        }
      } else {
        setAppUser(null);
      }
      
      setLoading(false);
      
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
    <AuthContext.Provider value={{ user, appUser, loading, expiredMessage, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
