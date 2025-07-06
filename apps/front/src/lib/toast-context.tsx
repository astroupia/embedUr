"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

interface ToastContextType {
  toasts: Array<ToastProps & { id: string }>;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const addToast = (toast: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    console.log('Toast: adding toast:', newToast);
    setToasts(prev => {
      const newToasts = [...prev, newToast];
      console.log('Toast: current toasts:', newToasts);
      return newToasts;
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string) => {
    console.log('Toast: showSuccess called with:', message);
    addToast({ message, type: 'success' });
  };

  const showError = (message: string) => {
    console.log('Toast: showError called with:', message);
    addToast({ message, type: 'error' });
  };

  const showInfo = (message: string) => {
    addToast({ message, type: 'info' });
  };

  const showWarning = (message: string) => {
    addToast({ message, type: 'warning' });
  };

  const value: ToastContextType = {
    toasts,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 