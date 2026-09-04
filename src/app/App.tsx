import { AppShell } from "./components/app-shell";
import { Toaster } from "sonner";
import { ThemeProvider } from "./contexts/theme-context";
import { AlertProvider } from "./contexts/alert-context";
import { SiteFilterProvider } from "./contexts/site-filter-context";
import { LegalAppointmentsProvider } from "./contexts/legal-appointments-context";
import { AuthProvider } from "./contexts/auth-context";
import { RecycleBinProvider } from "./contexts/recycle-bin-context";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginStaff } from "./pages/login-staff";
import { LoginClient } from "./pages/login-client";
import { LoginInspector } from "./pages/login-inspector";
import { ProtectedRoute } from "./components/protected-route";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <Routes>
            {/* Public routes — no auth required to reach these */}
            <Route path="/login/staff" element={<LoginStaff />} />
            <Route path="/login/client" element={<LoginClient />} />
            <Route path="/login/inspector" element={<LoginInspector />} />

            {/* Main app — everything below stays exactly as your original nesting */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["rss_staff", "client"]}>
                  <AlertProvider>
                    <SiteFilterProvider>
                      <LegalAppointmentsProvider>
                        <RecycleBinProvider>
                          <AppShell />
                        </RecycleBinProvider>
                      </LegalAppointmentsProvider>

                      <Toaster
                        position="bottom-center"
                        toastOptions={{
                          style: {
                            background: "#10B981",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            padding: "16px 20px",
                          },
                          success: {
                            style: {
                              background: "#10B981",
                            },
                          },
                        }}
                      />
                    </SiteFilterProvider>
                  </AlertProvider>
                </ProtectedRoute>
              }
            />

            {/* Anything unmatched falls back to the staff login */}
            <Route path="*" element={<Navigate to="/login/staff" replace />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}