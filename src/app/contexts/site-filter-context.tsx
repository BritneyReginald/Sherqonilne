import { createContext, useContext, useState, ReactNode } from "react";

interface Site {
  id: string;
  name: string;
}

interface SiteFilterContextType {
  selectedSite: Site | null;
  setSelectedSite: (site: Site | null) => void;
  clearSiteFilter: () => void;
}

const SiteFilterContext = createContext<SiteFilterContextType | undefined>(
  undefined
);

export function SiteFilterProvider({ children }: { children: ReactNode }) {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const clearSiteFilter = () => {
    setSelectedSite(null);
  };

  return (
    <SiteFilterContext.Provider
      value={{ selectedSite, setSelectedSite, clearSiteFilter }}
    >
      {children}
    </SiteFilterContext.Provider>
  );
}

export function useSiteFilter() {
  const context = useContext(SiteFilterContext);
  if (context === undefined) {
    throw new Error("useSiteFilter must be used within a SiteFilterProvider");
  }
  return context;
}
