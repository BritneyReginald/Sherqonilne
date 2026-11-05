// components/password-input.tsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "../contexts/theme-context";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  autoFocus?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  autoComplete = "current-password",
  autoFocus,
}: PasswordInputProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        required
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-3 pr-10 py-2 rounded-lg border outline-none"
        style={{
          backgroundColor: colors.background,
          color: colors.primaryText,
        }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 opacity-60 hover:opacity-100"
        style={{ color: colors.primaryText }}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}