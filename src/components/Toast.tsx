/**
 * Toast Notification Component
 * Accessible toast notifications for user feedback
 */

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  const styles = {
    success: {
      background: "var(--success-50)",
      border: "1px solid var(--success-200)",
      color: "var(--success-900)",
    },
    error: {
      background: "var(--danger-50)",
      border: "1px solid var(--danger-200)",
      color: "var(--danger-900)",
    },
    warning: {
      background: "var(--warning-50)",
      border: "1px solid var(--warning-200)",
      color: "var(--warning-900)",
    },
    info: {
      background: "var(--info-50)",
      border: "1px solid var(--info-200)",
      color: "var(--info-900)",
    },
  };

  return (
    <div
      className="toast toast-enter"
      style={{
        ...styles[type],
        padding: "var(--space-4)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        minWidth: "300px",
        maxWidth: "400px",
      }}
      role="alert"
      aria-live="polite"
    >
      <span style={{ fontSize: "1.25rem" }}>{icons[type]}</span>
      <div style={{ flex: 1, fontSize: "var(--text-sm)", fontWeight: 600 }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "1.25rem",
          opacity: 0.7,
          transition: "opacity var(--transition-fast)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        aria-label="Bildirimi kapat"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "var(--space-4)",
        right: "var(--space-4)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {children}
    </div>
  );
}
