"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useDemo } from "@/lib/context/DemoContext";
import { NotificationDropdown } from "./NotificationDropdown";
import type { Notification } from "@/types/notification";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "demo-1",
    tenantId: "tenant-001",
    companyId: "company-001",
    category: "policy_expiry",
    priority: "critical",
    channels: ["in_app", "email"],
    status: "sent",
    title: "ACIL: Kasko policeniz yarin sona eriyor",
    body: "Allianz - POL-2024-001 numarali Kasko policenizin vadesi yarin doluyor.",
    actionUrl: "/dashboard/renewals",
    recipient: { userId: "company_admin" },
    metadata: { policyType: "kasko", daysUntilExpiry: 1 },
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    tenantId: "tenant-001",
    companyId: "company-001",
    category: "policy_expiry",
    priority: "high",
    channels: ["in_app", "email"],
    status: "sent",
    title: "Yangin policeniz 7 gun icinde sona erecek",
    body: "AXA - POL-2024-003 numarali policenizin bitis tarihine 7 gun kaldi.",
    actionUrl: "/dashboard/renewals",
    recipient: { userId: "company_admin" },
    metadata: { policyType: "yangin", daysUntilExpiry: 7 },
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "demo-3",
    tenantId: "tenant-001",
    companyId: "company-001",
    category: "claim_update",
    priority: "high",
    channels: ["in_app"],
    status: "sent",
    title: "Hasar Guncelleme: POL-2024-005",
    body: "Hasar dosyaniza eksper atandi.",
    actionUrl: "/dashboard/claims",
    recipient: { userId: "company_admin" },
    metadata: { policyType: "kasko" },
    sentAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "demo-4",
    tenantId: "tenant-001",
    companyId: "company-001",
    category: "risk_alert",
    priority: "medium",
    channels: ["in_app"],
    status: "sent",
    title: "Risk Uyarisi",
    body: "Portfolyonuzde 2 yeni teminat acigi tespit edildi.",
    actionUrl: "/dashboard/risk-gaps",
    recipient: { userId: "company_admin" },
    metadata: {},
    sentAt: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export function NotificationBell() {
  const { appUser } = useAuth();
  const { isDemoMode } = useDemo();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (isDemoMode) {
      setNotifications(MOCK_NOTIFICATIONS);
      setUnreadCount(MOCK_NOTIFICATIONS.length);
      return;
    }

    if (!appUser) return;

    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: {
          "x-tenant-id": appUser.tenantId,
          "x-user-id": appUser.uid,
        },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [appUser, isDemoMode]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, status: "read" as const, readAt: new Date().toISOString() } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (!isDemoMode) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId }),
        });
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => n.status === "sent").map(n => n.id);

    setNotifications(prev =>
      prev.map(n => n.status === "sent" ? { ...n, status: "read" as const, readAt: new Date().toISOString() } : n)
    );
    setUnreadCount(0);

    if (!isDemoMode) {
      for (const id of unreadIds) {
        fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: id }),
        }).catch(() => {});
      }
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Bildirimler${unreadCount > 0 ? ` (${unreadCount} okunmamis)` : ""}`}
      >
        🔔
        {unreadCount > 0 && (
          <span className="badge-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllRead={handleMarkAllRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
