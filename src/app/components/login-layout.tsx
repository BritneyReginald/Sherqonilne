// components/login-layout.tsx
import { ReactNode } from "react";
import { useTheme } from "@/app/contexts/theme-context";

interface LoginLayoutProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}

export function LoginLayout({ title, subtitle, icon, children }: LoginLayoutProps) {
  const { colors } = useTheme();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--slate-dark)" }}
    >
      <div
        className="w-full max-w-md rounded-lg p-8"
        style={{
          backgroundColor: colors.surface,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="flex flex-col items-center mb-6">
          <div
            className="size-12 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: "var(--brand-blue)" }}
          >
            {icon}
          </div>
          <h1
            className="text-xl font-bold mb-1"
            style={{ color: "var(--brand-blue)" }}
          >
            SHERQ Online
          </h1>
          <h2 className="text-lg font-semibold" style={{ color: colors.primaryText }}>
            {title}
          </h2>
          <p className="text-sm mt-1 text-center" style={{ color: colors.subText }}>
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}