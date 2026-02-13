import { ReactNode } from "react";

interface PageLayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function PageLayout({
  title,
  description,
  children,
}: PageLayoutProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Page content wrapper */}
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Page header */}
        {(title || description) && (
          <header className="mb-8">
            {title && (
              <h1 className="text-2xl font-semibold text-foreground">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-muted-foreground max-w-3xl">
                {description}
              </p>
            )}
          </header>
        )}

        {/* Page body */}
        {children}
      </div>
    </main>
  );
}
