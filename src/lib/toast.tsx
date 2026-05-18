"use client";

import { ReactNode } from "react";

let toastContainer: HTMLDivElement | null = null;

function getToastContainer(): HTMLDivElement {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function createToastElement(message: string, type: "success" | "error" | "info"): HTMLDivElement {
  const toast = document.createElement("div");

  const bgColors = {
    success: "linear-gradient(135deg, #10b981, #059669)",
    error: "linear-gradient(135deg, #ef4444, #dc2626)",
    info: "linear-gradient(135deg, #3b82f6, #2563eb)",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "i",
  };

  toast.style.cssText = `
    background: ${bgColors[type]};
    color: white;
    padding: 0.875rem 1.25rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
    max-width: 400px;
    font-family: Inter, system-ui, sans-serif;
  `;

  toast.innerHTML = `
    <span style="
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 1rem;
    ">${icons[type]}</span>
    <span>${message}</span>
  `;

  return toast;
}

function showToast(message: string, type: "success" | "error" | "info", duration = 3500) {
  if (typeof window === "undefined") return;

  const container = getToastContainer();
  const toast = createToastElement(message, type);

  // Add animation styles
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(120%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(120%);
        opacity: 0;
      }
    }
  `;
  if (!document.getElementById("toast-styles")) {
    styleSheet.id = "toast-styles";
    document.head.appendChild(styleSheet);
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, duration);
}

export const toast = {
  success: (message: string, duration?: number) => showToast(message, "success", duration),
  error: (message: string, duration?: number) => showToast(message, "error", duration),
  info: (message: string, duration?: number) => showToast(message, "info", duration),
};
