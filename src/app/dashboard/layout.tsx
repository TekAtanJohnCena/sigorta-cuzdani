"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { DemoProvider } from "@/lib/context/DemoContext";
import RightPanel from "@/components/RightPanel";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationBell } from "@/components/notifications";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { useDemo } from "@/lib/context/DemoContext";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  highlight?: boolean;
  badge?: number;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const NAV_ITEMS: NavSection[] = [
  {
    section: "Genel",
    items: [
      { href: "/dashboard", icon: "📊", label: "Dashboard" },
      { href: "/dashboard/policies", icon: "📋", label: "Poliçeler" },
      { href: "/dashboard/upload", icon: "📤", label: "Belge Yükle", highlight: true },
    ],
  },
  {
    section: "Analiz & Operasyon",
    items: [
      { href: "/dashboard/ai-analysis", icon: "🤖", label: "AI Analizi", highlight: true, badge: 0 }, // badge will be set dynamically
      { href: "/dashboard/risk-gaps", icon: "🎯", label: "Risk Açıkları" },
      { href: "/dashboard/assets", icon: "🏗️", label: "Varlık Envanteri" },
      { href: "/dashboard/renewals", icon: "🔄", label: "Teklif & Yenileme" },
      { href: "/dashboard/claims", icon: "🚨", label: "Hasar Merkezi" },
      { href: "/dashboard/calendar", icon: "📅", label: "Vade Takvimi" },
      { href: "/dashboard/finance", icon: "💰", label: "Finansal Analiz" },
      { href: "/dashboard/alerts", icon: "🔔", label: "Uyarılar" },
    ],
  },
  {
    section: "Yönetim",
    items: [
      { href: "/dashboard/hr", icon: "👥", label: "Personel" },
      { href: "/dashboard/settings", icon: "⚙️", label: "Ayarlar" },
    ],
  },
];

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const { appUser, logout } = useAuth();
  const { isDemoMode } = useDemo();
  const [criticalAlertCount, setCriticalAlertCount] = useState<number>(0);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  // Fetch critical alert count on mount
  useEffect(() => {
    async function fetchAlerts() {
      if (isDemoMode) {
        setCriticalAlertCount(0); // Mock data for demo
        return;
      }
      if (!appUser) return;

      try {
        const res = await fetch("/api/ai/critical-alerts");
        const data = await res.json();
        if (data.success) {
          setCriticalAlertCount(data.data.criticalCount);
        }
      } catch (err) {
        console.error("Failed to fetch critical alerts:", err);
      }
    }

    fetchAlerts();
  }, [appUser, isDemoMode]);

  return (
    <ErrorBoundary>
      <DemoProvider>
        <div className="layout-wrapper">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="modal-backdrop"
            style={{ zIndex: 199 }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🛡️</div>
            <div>
              <div className="sidebar-logo-text">Sigorta Cüzdanı</div>
            </div>
            <span className="sidebar-logo-badge">Beta</span>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((section) => (
              <div key={section.section}>
                <div className="sidebar-section-label">{section.section}</div>
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                  // Dynamic badge for AI Analysis
                  const displayBadge = item.href === "/dashboard/ai-analysis" && criticalAlertCount > 0
                    ? criticalAlertCount
                    : item.badge;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-link ${isActive ? "active" : ""}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="sidebar-link-icon">{item.icon}</span>
                      <span>{item.label}</span>
                      {displayBadge !== undefined && displayBadge > 0 && (
                        <span className="sidebar-link-badge">{displayBadge}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <div className="sidebar-user-avatar">{appUser ? appUser.name.substring(0,2).toUpperCase() : "?"}</div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{appUser?.name || "Yükleniyor..."}</div>
                  <div className="sidebar-user-role" style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                    {appUser?.companyName ? appUser.companyName : (appUser?.role === 'admin' ? "Yönetici" : "Personel")}
                  </div>
                </div>
              </div>
              <button onClick={logout} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 18 }} title="Çıkış Yap">
                🚪
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="main-content">
          <header className="main-header">
            <div className="main-header-left">
              {/* Mobile hamburger */}
              <button
                className="btn btn-ghost btn-icon mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                id="mobile-menu-btn"
              >
                ☰
              </button>
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Poliçe, şirket veya numara ara..."
                  id="global-search"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <span className="search-shortcut">⌘K</span>
              </div>
            </div>

            <div className="main-header-right">
              <NotificationBell />
              <Link href="/dashboard/upload" className="btn btn-primary btn-sm" id="upload-btn" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                📤 Belge Yükle
              </Link>
            </div>
          </header>

          <div className="main-with-panel">
            <main className="main-body">
              <OnboardingBanner />
              {children}
            </main>
            <Suspense fallback={null}>
              <RightPanel />
            </Suspense>
          </div>
        </div>

        </div>
      </DemoProvider>
    </ErrorBoundary>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <DemoProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </Suspense>
      </DemoProvider>
    </ErrorBoundary>
  );
}
