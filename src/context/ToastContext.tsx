import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Sparkles,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'gebol';

export interface Toast {
  id: string;
  text: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    gebol: (title: string, message?: string) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    // Single-line text formulation without subheadings or subtexts
    let text = title;
    if (message) {
      if (message.toLowerCase().includes(title.toLowerCase().replace('!', ''))) {
        text = message;
      } else {
        text = `${title}: ${message}`;
      }
    }
    const newToast: Toast = { id, text, type };

    setToasts((prev) => [...prev.slice(-3), newToast]); // Keep max 4 visible

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  const toast = {
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
    gebol: (title: string, message?: string) => addToast('gebol', title, message),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}

      {/* Floating Toast Notification Container - Top Right */}
      <div className="fixed top-4 right-4 z-9999 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2 sm:px-0 font-sans">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg shadow-lg border-l-4 border-y border-r border-gray-200 bg-white text-[#1A1A1A] px-3.5 py-2.5 flex items-start gap-2.5 text-xs transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
              t.type === 'gebol'
                ? 'border-l-[#F8B800]'
                : t.type === 'success'
                ? 'border-l-emerald-500'
                : t.type === 'error'
                ? 'border-l-red-500'
                : t.type === 'warning'
                ? 'border-l-amber-500'
                : 'border-l-blue-500'
            }`}
          >
            {/* Minimal Icon */}
            <div className="shrink-0 mt-0.5">
              {t.type === 'gebol' && <Sparkles className="w-4 h-4 text-[#F8B800]" />}
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {t.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
              {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
            </div>

            {/* Wrapped Text Content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-[#1A1A1A] leading-snug break-words whitespace-normal">
                {t.text}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-0.5 rounded hover:bg-gray-100 shrink-0 mt-0.5"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

