import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastViewport,
} from "@/components/ui/toast";

type ToastType = "success" | "error" | "neutral";

interface ToastContextProps {
  showToast: (message: string, type: ToastType, txLink?: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<ToastType>("neutral");
  const [txLink, setTxLink] = useState<string | undefined>(undefined);

  const triggerToast = (message: string, type: ToastType, txLink?: string) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTxLink(txLink);
  };

  return (
    <ToastContext.Provider value={{ showToast: triggerToast }}>
      <ToastProvider>
        {children}
        {showToast && (
          <Toast
            onOpenChange={setShowToast}
            open={showToast}
            className={
              toastType === "success"
                ? "toast-success"
                : toastType === "error"
                  ? "toast-error"
                  : "toast-neutral"
            }
          >
            <ToastTitle>
              {toastType === "success"
                ? "Success"
                : toastType === "error"
                  ? "Error"
                  : "Info"}
            </ToastTitle>
            <ToastDescription>
              {toastMessage}
              {txLink && (
                <div>
                  <a
                    href={txLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      toastType === "success"
                        ? "green-link"
                        : toastType === "error"
                          ? "red-link"
                          : "gray-link"
                    }
                  >
                    <div className="flex flex-row gap-1">
                      View Transaction{" "}
                      <img
                        src={"/assets/icons/link-to-dark.svg"}
                        height={16}
                        width={16}
                      />
                    </div>
                  </a>
                </div>
              )}
            </ToastDescription>
          </Toast>
        )}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
};
