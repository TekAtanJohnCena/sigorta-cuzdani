"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { DemoProvider } from "@/lib/context/DemoContext";

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
      { href: "/dashboard/ai-analysis", icon: "🤖", label: "AI Analizi", highlight: true },
      { href: "/dashboard/calendar", icon: "📅", label: "Vade Takvimi" },
      { href: "/dashboard/finance", icon: "💰", label: "Finansal Analiz" },
      { href: "/dashboard/alerts", icon: "🔔", label: "Uyarılar" },
    ],
  },
  {
    section: "Sistem",
    items: [
      { href: "/dashboard/users", icon: "👥", label: "Personel Yönetimi" },
      { href: "/dashboard/settings", icon: "⚙️", label: "Ayarlar" },
    ],
  },
];

export default function DashboardLayout({
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

  // Sync search state with URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // Update URL debounced-like or immediately for MVP
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    
    // Use replace to avoid bloating history
    router.replace(`${pathname}?${params.toString()}`);
  };
  
  const navItems = useMemo(() => {
    // Filter out admin-only pages for non-admin users
    if (appUser?.role !== 'admin') {
      return NAV_ITEMS.map(section => ({
        ...section,
        items: section.items.filter(item => item.href !== '/dashboard/users')
      }));
    }
    return NAV_ITEMS;
  }, [appUser]);

  return (
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
            {navItems.map((section) => (
              <div key={section.section}>
                <div className="sidebar-section-label">{section.section}</div>
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-link ${isActive ? "active" : ""}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="sidebar-link-icon">{item.icon}</span>
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="sidebar-link-badge">{item.badge}</span>
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
                  <div className="sidebar-user-role">{appUser?.role === 'admin' ? "Yönetici" : "Personel"}</div>
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
              <Link href="/dashboard/alerts" className="notification-bell" id="notifications-btn" style={{ textDecoration: 'none' }}>
                🔔
              </Link>
              <Link href="/dashboard/upload" className="btn btn-primary btn-sm" id="upload-btn" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                📤 Belge Yükle
              </Link>
            </div>
          </header>

          <main className="main-body">{children}</main>
        </div>

      </div>
    </DemoProvider>
  );
}
