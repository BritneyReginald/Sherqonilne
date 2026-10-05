import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface RecycleItem {
  id: string;
  name: string;
  type: string;
  data: any;
  deletedAt: string;
}

interface RecycleBinContextType {
  items: RecycleItem[];
  moveToRecycleBin: (item: RecycleItem) => void;
  restoreItem: (id: string) => void;
}

const RecycleBinContext = createContext<RecycleBinContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "recycleBin";

export function RecycleBinProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RecycleItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Single place that persists, so add and restore can never drift apart
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const moveToRecycleBin = (item: RecycleItem) =>
    setItems((prev) => [item, ...prev]);

  const restoreItem = (id: string) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <RecycleBinContext.Provider
      value={{ items, moveToRecycleBin, restoreItem }}
    >
      {children}
    </RecycleBinContext.Provider>
  );
}

export function useRecycleBin() {
  const context = useContext(RecycleBinContext);
  if (!context) {
    throw new Error("useRecycleBin must be used inside RecycleBinProvider");
  }
  return context;
}
