// ============================================
// usePolicies — Custom React Hook
// G-08: Merkezi veri çekme, loading ve error yönetimi
// M-02: 10+ sayfadaki tekrar eden useEffect pattern'ini elimine eder
// ============================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { getPoliciesByTenant } from "@/lib/firebase/firestore";
import { Policy } from "@/types/policy";

// ─── Return Type ────────────────────────────────────────────────────────────

export interface UsePoliciesResult {
  /** Firestore'dan çekilen poliçe listesi */
  policies: Policy[];
  /** Veri yüklenirken true */
  loading: boolean;
  /** Hata mesajı — null ise hata yok */
  error: string | null;
  /** Poliçeleri manuel olarak yeniden çek */
  refetch: () => void;
  /** Pagination state */
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Verilen `tenantId` için Firestore'dan poliçeleri çeken custom hook.
 *
 * Kullanım:
 *   const { policies, loading, error, refetch } = usePolicies(appUser?.tenantId);
 *
 * @param tenantId - Firestore'daki tenant izolasyon kimliği
 * @returns UsePoliciesResult
 */
export function usePolicies(tenantId: string | undefined | null, pageSize: number = 25): UsePoliciesResult {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchPolicies = useCallback(async () => {
    // tenantId olmadan istek yapma
    if (!tenantId) {
      setLoading(false);
      setPolicies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getPoliciesByTenant(tenantId);
      setPolicies(data as unknown as Policy[]);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Poliçeler yüklenirken bilinmeyen bir hata oluştu.";

      // Kurumsal loglama — hatayı sessizce yutmuyoruz
      console.error("[usePolicies] Firestore fetch failed:", {
        tenantId,
        error: message,
        timestamp: new Date().toISOString(),
      });

      setError(message);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // tenantId değiştiğinde veya mount'ta otomatik çek
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  // Pagination calculations
  const totalItems = policies.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNext]);

  const previousPage = useCallback(() => {
    if (hasPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPrevious]);

  return {
    policies,
    loading,
    error,
    refetch: fetchPolicies,
    pagination: {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      goToPage,
      nextPage,
      previousPage,
      hasNext,
      hasPrevious,
    },
  };
}
