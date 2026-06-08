import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ title, description }) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, title, description }]);
      window.setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      dismissToast
    }),
    [dismissToast, pushToast, toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

function useToasts() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToasts must be used within ToastProvider");
  }

  return context;
}

export { ToastProvider, useToasts };
