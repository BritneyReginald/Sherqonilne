import { createContext, useContext, useState, ReactNode } from "react";

interface DismissedAlert {
  id: string;
  dismissedAt: Date;
  title: string;
  type: "critical" | "warning" | "info";
}

interface AlertContextType {
  dismissedAlerts: DismissedAlert[];
  dismissAlert: (id: string, title: string, type: "critical" | "warning" | "info") => void;
  clearDismissedAlert: (id: string) => void;
  clearAllDismissedAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [dismissedAlerts, setDismissedAlerts] = useState<DismissedAlert[]>([]);

  const dismissAlert = (id: string, title: string, type: "critical" | "warning" | "info") => {
    setDismissedAlerts((prev) => [
      ...prev,
      {
        id,
        dismissedAt: new Date(),
        title,
        type,
      },
    ]);
  };

  const clearDismissedAlert = (id: string) => {
    setDismissedAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const clearAllDismissedAlerts = () => {
    setDismissedAlerts([]);
  };

  return (
    <AlertContext.Provider
      value={{
        dismissedAlerts,
        dismissAlert,
        clearDismissedAlert,
        clearAllDismissedAlerts,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
}
