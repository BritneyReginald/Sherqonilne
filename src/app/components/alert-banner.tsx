import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/app/contexts/theme-context";

export type AlertType = "critical" | "warning" | "info";

interface AlertBannerProps {
  id: string;
  type: AlertType;
  icon: React.ReactNode;
  title: string;
  description: string;
  onDismiss?: (id: string) => void;
}

export function AlertBanner({
  id,
  type,
  icon,
  title,
  description,
  onDismiss,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const { colors } = useTheme();

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss(id);
      }
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  const getStyles = () => {
    switch (type) {
      case "critical":
        return {
          backgroundColor: "var(--compliance-danger)",
          textColor: "white",
          iconColor: "white",
          descriptionColor: "rgba(255, 255, 255, 0.9)",
          buttonBg: "rgba(255, 255, 255, 0.2)",
        };
      case "warning":
        // High-contrast inverted alert bar
        // Dark Mode: White bar with dark text
        // Light Mode: Midnight Blue bar with white text
        return {
          backgroundColor: colors.alertBarBg,
          textColor: colors.alertBarText,
          iconColor: colors.alertBarText,
          descriptionColor: colors.alertBarText === "#FFFFFF" ? "rgba(255, 255, 255, 0.85)" : "#475569",
          buttonBg: colors.alertBarText === "#FFFFFF" ? "rgba(255, 255, 255, 0.2)" : "rgba(15, 23, 42, 0.05)",
        };
      case "info":
        return {
          backgroundColor: "#3B82F6",
          textColor: "white",
          iconColor: "white",
          descriptionColor: "rgba(255, 255, 255, 0.9)",
          buttonBg: "rgba(255, 255, 255, 0.2)",
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className="px-8 py-4 flex items-center gap-3 transition-all duration-300"
      style={{
        backgroundColor: styles.backgroundColor,
        transform: isAnimatingOut ? "translateY(-100%)" : "translateY(0)",
        opacity: isAnimatingOut ? 0 : 1,
        maxHeight: isAnimatingOut ? "0" : "100px",
        overflow: "hidden",
      }}
    >
      <div style={{ color: styles.iconColor }}>{icon}</div>
      <div className="flex-1">
        <p className="font-medium text-sm" style={{ color: styles.textColor }}>
          {title}
        </p>
        <p
          className="text-xs"
          style={{
            color: styles.descriptionColor,
          }}
        >
          {description}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="p-2 rounded-lg transition-opacity hover:opacity-70"
        style={{
          backgroundColor: styles.buttonBg,
        }}
        aria-label="Dismiss alert"
      >
        <X className="size-4" style={{ color: styles.iconColor }} />
      </button>
    </div>
  );
}