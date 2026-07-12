"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from "lucide-react";
import { cn } from "../utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => addToast(msg, "success"), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, "error"), [addToast]);
  const info = useCallback((msg: string) => addToast(msg, "info"), [addToast]);
  const warning = useCallback((msg: string) => addToast(msg, "warning"), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      {toasts.length > 0 &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-70 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
    error: <AlertCircle size={18} className="text-red-400 shrink-0" />,
    info: <Info size={18} className="text-blue-400 shrink-0" />,
    warning: <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/20 bg-emerald-500/5",
    error: "border-red-500/20 bg-red-500/5",
    info: "border-blue-500/20 bg-blue-500/5",
    warning: "border-amber-500/20 bg-amber-500/5",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border bg-card/90 backdrop-blur-md text-foreground shadow-2xl pointer-events-auto",
        "transition-all duration-300 ease-in-out",
        borders[toast.type],
      )}
    >
      {icons[toast.type]}
      <p className="text-xs font-medium leading-relaxed flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer p-0.5 rounded hover:bg-secondary transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
