import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const { t } = useTranslation();
  const [state, setState] = useState(null); // { message, resolve }
  const resolveRef = useRef(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ message, options });
    });
  }, []);

  function handleAction(result) {
    setState(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => handleAction(false)}
          />
          {/* Dialog */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card shadow-2xl p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="confirm-title" className="text-sm font-semibold text-foreground mb-1">
                  {state.options?.title ?? t("common.confirm")}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {state.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                autoFocus
                onClick={() => handleAction(false)}
                className="h-9 px-4 rounded-md border text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-colors"
              >
                {state.options?.cancelLabel ?? t("common.cancel")}
              </button>
              <button
                onClick={() => handleAction(true)}
                className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
              >
                {state.options?.confirmLabel ?? t("common.confirmDelete")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
