import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function StyleGuide() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Header */}
      <header className="mb-16 pb-8 border-b border-border">
        <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--brand-blue)' }}>
          SHERQ Online
        </h1>
        <p className="text-xl" style={{ color: 'var(--grey-600)' }}>
          Enterprise SaaS Platform - UI Style Guide
        </p>
        <p className="mt-2" style={{ color: 'var(--grey-500)' }}>
          Clean, modern, professional design system for auditors and legal compliance
        </p>
      </header>

      {/* Brand Colors */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6" style={{ color: 'var(--grey-900)' }}>
          Brand Colors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ColorSwatch
            name="Primary Blue"
            variable="--brand-blue"
            hex="#0B3D91"
            description="Deep corporate blue - Primary brand color"
            textColor="white"
          />
          <ColorSwatch
            name="Primary Blue Light"
            variable="--brand-blue-light"
            hex="#1E5AB8"
            description="Lighter variant for hover states"
            textColor="white"
          />
          <ColorSwatch
            name="Primary Blue Dark"
            variable="--brand-blue-dark"
            hex="#072A66"
            description="Darker variant for pressed states"
            textColor="white"
          />
        </div>
      </section>

      {/* Traffic Light Compliance System */}
      <section className="mb-16">
        <h2 className="text-3xl mb-4" style={{ color: 'var(--grey-900)' }}>
          Traffic Light Compliance System
        </h2>
        <p className="mb-6" style={{ color: 'var(--grey-600)' }}>
          Core status indicators for compliance tracking and auditing
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ColorSwatch
            name="Compliant / Valid"
            variable="--compliance-success"
            hex="#10B981"
            description="Emerald Green - All requirements met"
            icon={<CheckCircle2 className="size-6" />}
            textColor="white"
          />
          <ColorSwatch
            name="Expiring Soon / Warning"
            variable="--compliance-warning"
            hex="#F59E0B"
            description="Amber - Attention required"
            icon={<AlertTriangle className="size-6" />}
            textColor="white"
          />
          <ColorSwatch
            name="Non-Compliant / Expired"
            variable="--compliance-danger"
            hex="#EF4444"
            description="Bright Red - Immediate action needed"
            icon={<XCircle className="size-6" />}
            textColor="white"
          />
        </div>

        {/* Color Variants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <p className="font-medium" style={{ color: 'var(--grey-700)' }}>Success Variants</p>
            <div className="flex gap-2">
              <div 
                className="flex-1 h-16 rounded-lg border border-border flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: 'var(--compliance-success-dark)' }}
              >
                Dark
              </div>
              <div 
                className="flex-1 h-16 rounded-lg border border-border flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: 'var(--compliance-success)' }}
              >
                Base
              </div>
              <div 
                className="flex-1 h-16 rounded-lg border border-border flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: 'var(--compliance-success-light)' }}
              >
                Light
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-medium" style={{ color: 'var(--grey-700)' }}>Warning Variants</p>
            <div className="flex gap-2">
              <div 
                className="flex-1 h-16 rounded-lg border border-border flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: 'var(--compliance-warning-dark)' }}
              >
                Dark
              </div>
              <div 
                className="flex-1 h-16 rounded-lg border border-border flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: 'var(--compliance-warning)' }}
              >
                Base
              </div>
              <div 
                className="flex-1 h-16 rounded-lg border border-border flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: 'var(--compliance-warning-light)' }}
              >
                Light
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-medium" style={{ color: 'var(--grey-700)' }}>Danger Variants</p>
            <div className="flex gap-2">
              <div 
                className="flex-1 h-16 rounded-lg border border-border flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: 'var(--compliance-danger-dark)' }}
              >
                Dark
              </div>
              <div 
                className="flex-1 h-16 rounded-lg border border-border flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: 'var(--compliance-danger)' }}
              >
                Base
              </div>
              <div 
                className="flex-1 h-16 rounded-lg border border-border flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: 'var(--compliance-danger-light)' }}
              >
                Light
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Neutral Greys */}
      <section className="mb-16">
        <h2 className="text-3xl mb-4" style={{ color: 'var(--grey-900)' }}>
          Neutral Greys
        </h2>
        <p className="mb-6" style={{ color: 'var(--grey-600)' }}>
          Background, text, and UI element colors
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <GreySwatch shade="50" hex="#F9FAFB" />
          <GreySwatch shade="100" hex="#F3F4F6" />
          <GreySwatch shade="200" hex="#E5E7EB" />
          <GreySwatch shade="300" hex="#D1D5DB" />
          <GreySwatch shade="400" hex="#9CA3AF" />
          <GreySwatch shade="500" hex="#6B7280" />
          <GreySwatch shade="600" hex="#4B5563" />
          <GreySwatch shade="700" hex="#374151" />
          <GreySwatch shade="800" hex="#1F2937" />
          <GreySwatch shade="900" hex="#111827" />
        </div>
      </section>

      {/* Typography */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6" style={{ color: 'var(--grey-900)' }}>
          Typography
        </h2>
        <div className="space-y-8 bg-card border border-border rounded-lg p-8">
          <div>
            <p className="text-sm mb-2" style={{ color: 'var(--grey-500)' }}>
              Typeface: System Sans-Serif Stack
            </p>
            <p style={{ color: 'var(--grey-700)' }}>
              -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-border">
            <div>
              <h1 className="mb-2">Heading 1 - Display Large</h1>
              <p className="text-sm" style={{ color: 'var(--grey-500)' }}>
                2xl / Medium / Line height 1.5
              </p>
            </div>

            <div>
              <h2 className="mb-2">Heading 2 - Display Medium</h2>
              <p className="text-sm" style={{ color: 'var(--grey-500)' }}>
                xl / Medium / Line height 1.5
              </p>
            </div>

            <div>
              <h3 className="mb-2">Heading 3 - Display Small</h3>
              <p className="text-sm" style={{ color: 'var(--grey-500)' }}>
                lg / Medium / Line height 1.5
              </p>
            </div>

            <div>
              <h4 className="mb-2">Heading 4 - Section Title</h4>
              <p className="text-sm" style={{ color: 'var(--grey-500)' }}>
                base / Medium / Line height 1.5
              </p>
            </div>

            <div>
              <p className="mb-2">Body Text - Regular paragraph text for content and descriptions. Clean, readable, and professional.</p>
              <p className="text-sm" style={{ color: 'var(--grey-500)' }}>
                base / Normal / Line height 1.5
              </p>
            </div>

            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--grey-600)' }}>
                Small Text - Supporting information, captions, and metadata
              </p>
              <p className="text-sm" style={{ color: 'var(--grey-500)' }}>
                sm / Normal / Line height 1.5
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6" style={{ color: 'var(--grey-900)' }}>
          Compliance Badge Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ComplianceBadge
            status="success"
            label="Certificate Valid"
            sublabel="Expires in 45 days"
          />
          <ComplianceBadge
            status="warning"
            label="Renewal Required"
            sublabel="Expires in 14 days"
          />
          <ComplianceBadge
            status="danger"
            label="Expired"
            sublabel="Action required"
          />
        </div>
      </section>

      {/* Design Principles */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6" style={{ color: 'var(--grey-900)' }}>
          Design Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="mb-3" style={{ color: 'var(--brand-blue)' }}>Professional & Trustworthy</h3>
            <p style={{ color: 'var(--grey-600)' }}>
              Clear hierarchy, consistent spacing, and professional color palette instill confidence in enterprise users.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="mb-3" style={{ color: 'var(--brand-blue)' }}>Instant Status Recognition</h3>
            <p style={{ color: 'var(--grey-600)' }}>
              Traffic light system enables auditors to identify compliance issues at a glance without reading details.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="mb-3" style={{ color: 'var(--brand-blue)' }}>Accessible & Inclusive</h3>
            <p style={{ color: 'var(--grey-600)' }}>
              High contrast ratios, clear typography, and icon support ensure accessibility for all users.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="mb-3" style={{ color: 'var(--brand-blue)' }}>Scalable & Consistent</h3>
            <p style={{ color: 'var(--grey-600)' }}>
              Token-based design system ensures consistency across the platform and enables easy theme customization.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ColorSwatchProps {
  name: string;
  variable: string;
  hex: string;
  description: string;
  icon?: React.ReactNode;
  textColor?: string;
}

function ColorSwatch({ name, variable, hex, description, icon, textColor = 'white' }: ColorSwatchProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div 
        className="h-32 flex items-center justify-center"
        style={{ backgroundColor: `var(${variable})`, color: textColor }}
      >
        {icon}
      </div>
      <div className="p-4">
        <h3 className="mb-1" style={{ color: 'var(--grey-900)' }}>{name}</h3>
        <p className="text-sm mb-2" style={{ color: 'var(--grey-600)' }}>{description}</p>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--grey-500)' }}>
          <code className="bg-secondary px-2 py-1 rounded">{variable}</code>
          <code className="bg-secondary px-2 py-1 rounded">{hex}</code>
        </div>
      </div>
    </div>
  );
}

interface GreySwatchProps {
  shade: string;
  hex: string;
}

function GreySwatch({ shade, hex }: GreySwatchProps) {
  const isLight = parseInt(shade) < 400;
  return (
    <div className="space-y-2">
      <div 
        className="h-20 rounded-lg border border-border flex items-center justify-center"
        style={{ backgroundColor: `var(--grey-${shade})` }}
      >
        <span 
          className="text-sm font-medium"
          style={{ color: isLight ? 'var(--grey-900)' : 'white' }}
        >
          {shade}
        </span>
      </div>
      <p className="text-xs text-center" style={{ color: 'var(--grey-500)' }}>
        {hex}
      </p>
    </div>
  );
}

interface ComplianceBadgeProps {
  status: 'success' | 'warning' | 'danger';
  label: string;
  sublabel: string;
}

function ComplianceBadge({ status, label, sublabel }: ComplianceBadgeProps) {
  const statusConfig = {
    success: {
      bg: 'var(--compliance-success)',
      icon: <CheckCircle2 className="size-5" />,
    },
    warning: {
      bg: 'var(--compliance-warning)',
      icon: <AlertTriangle className="size-5" />,
    },
    danger: {
      bg: 'var(--compliance-danger)',
      icon: <XCircle className="size-5" />,
    },
  };

  const config = statusConfig[status];

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div 
        className="p-4 flex items-center gap-3 text-white"
        style={{ backgroundColor: config.bg }}
      >
        {config.icon}
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm opacity-90">{sublabel}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm" style={{ color: 'var(--grey-600)' }}>
          Example usage in compliance dashboards and audit reports
        </p>
      </div>
    </div>
  );
}
