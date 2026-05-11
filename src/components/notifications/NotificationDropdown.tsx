"use client";

import { useRouter } from "next/navigation";
import type { Notification, NotificationCategory, NotificationPriority } from "@/types/notification";

interface Props {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<NotificationCategory, { icon: string; color: string }> = {
  policy_expiry: { icon: "⏰", color: "var(--warning-500)" },
  payment_reminder: { icon: "💳", color: "var(--accent-500)" },
  claim_update: { icon: "📋", color: "var(--primary-500)" },
  risk_alert: { icon: "⚠️", color: "var(--danger-500)" },
  renewal_action: { icon: "🔄", color: "var(--success-500)" },
  system: { icon: "ℹ️", color: "var(--neutral-400)" },
};

const PRIORITY_BORDER: Record<NotificationPriority, string> = {
  critical: "var(--danger-500)",
  high: "var(--warning-500)",
  medium: "var(--primary-500)",
  low: "var(--neutral-300)",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Az once";
  if (minutes < 60) return `${minutes} dk once`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat once`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gun once`;

  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export function NotificationDropdown({ notifications, loading, onMarkAsRead, onMarkAllRead, onClose }: Props) {
  const router = useRouter();
  const unreadCount = notifications.filter(n => n.status === "sent").length;

  function handleClick(notification: Notification) {
    if (notification.status === "sent") {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
  }

  return (
    <div style={{
      position: "absolute",
      top: "calc(100% + 8px)",
      right: 0,
      width: 380,
      maxHeight: 480,
      background: "var(--bg-primary)",
      border: "1px solid var(--border-light)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.2)",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px 12px",
        borderBottom: "1px solid var(--border-light)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-primary)" }}>
            Bildirimler
          </h3>
          {unreadCount > 0 && (
            <span style={{
              background: "var(--danger-500)",
              color: "white",
              borderRadius: "var(--radius-full)",
              padding: "2px 8px",
              fontSize: "11px",
              fontWeight: 700,
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary-500)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "var(--radius-sm)",
              transition: "background var(--transition-fast)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            Tumunu okundu isaretle
          </button>
        )}
      </div>

      {/* Notification List */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {loading && (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)" }}>
            Yukleniyor...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <EmptyState />
        )}

        {!loading && notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => handleClick(notification)}
          />
        ))}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--border-light)",
          textAlign: "center",
        }}>
          <button
            onClick={() => { router.push("/dashboard/alerts"); onClose(); }}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary-500)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tum bildirimleri gor →
          </button>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification, onClick }: { notification: Notification; onClick: () => void }) {
  const config = CATEGORY_CONFIG[notification.category] || CATEGORY_CONFIG.system;
  const isUnread = notification.status === "sent";
  const borderColor = PRIORITY_BORDER[notification.priority] || PRIORITY_BORDER.low;

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 20px",
        width: "100%",
        textAlign: "left",
        background: isUnread ? "var(--bg-secondary)" : "transparent",
        border: "none",
        borderLeft: `3px solid ${isUnread ? borderColor : "transparent"}`,
        cursor: "pointer",
        transition: "background var(--transition-fast)",
        borderBottom: "1px solid var(--border-light)",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--neutral-50, var(--bg-secondary))")}
      onMouseLeave={e => (e.currentTarget.style.background = isUnread ? "var(--bg-secondary)" : "transparent")}
    >
      {/* Icon */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: "var(--radius-md)",
        background: `color-mix(in srgb, ${config.color} 15%, transparent)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        flexShrink: 0,
      }}>
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "13px",
          fontWeight: isUnread ? 700 : 500,
          color: "var(--text-primary)",
          marginBottom: 3,
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {notification.title}
        </div>
        <div style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          lineHeight: 1.4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {notification.body}
        </div>
        <div style={{
          fontSize: "11px",
          color: "var(--text-tertiary, var(--neutral-400))",
          marginTop: 4,
        }}>
          {timeAgo(notification.sentAt || notification.createdAt)}
        </div>
      </div>

      {/* Unread indicator */}
      {isUnread && (
        <div style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--primary-500)",
          flexShrink: 0,
          marginTop: 4,
        }} />
      )}
    </button>
  );
}

function EmptyState() {
  return (
    <div style={{
      padding: "48px 24px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: "var(--radius-full)",
        background: "var(--bg-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
      }}>
        🔕
      </div>
      <div>
        <p style={{
          margin: 0,
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--text-primary)",
        }}>
          Bildiriminiz bulunmuyor
        </p>
        <p style={{
          margin: "4px 0 0",
          fontSize: "12px",
          color: "var(--text-secondary)",
          lineHeight: 1.4,
        }}>
          Poliçe vadeleri, hasar guncellemeleri ve risk uyarilari burada gorunecek.
        </p>
      </div>
    </div>
  );
}
