import { createContext, useContext, useState, ReactNode } from "react";

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

export function RecycleBinProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<RecycleItem[]>(
  JSON.parse(
    localStorage.getItem("recycleBin") || "[]"
  )
);

  const moveToRecycleBin = (item: RecycleItem) => {

  const updated = [item, ...items];

  setItems(updated);

  localStorage.setItem(
    "recycleBin",
    JSON.stringify(updated)
  );
};

  const restoreItem = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <RecycleBinContext.Provider
      value={{
        items,
        moveToRecycleBin,
        restoreItem,
      }}
    >
      {children}
    </RecycleBinContext.Provider>
  );
}

export function useRecycleBin() {
  const context = useContext(RecycleBinContext);

  if (!context) {
    throw new Error(
      "useRecycleBin must be used inside RecycleBinProvider",
    );
  }

  return context;
}