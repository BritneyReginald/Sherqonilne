import { AppShell } from "@/app/components/app-shell";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/app/contexts/theme-context";
import { AlertProvider } from "@/app/contexts/alert-context";
import { SiteFilterProvider } from "@/app/contexts/site-filter-context";

export default function App() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <SiteFilterProvider>
          <AppShell />
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '16px 20px',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
            }}
          />
        </SiteFilterProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}