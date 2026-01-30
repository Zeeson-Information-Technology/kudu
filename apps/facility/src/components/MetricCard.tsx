"use client";

import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: number;
  };
  icon?: ReactNode;
  status?: "healthy" | "warning" | "critical";
  description?: string;
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  unit,
  trend,
  icon,
  status = "healthy",
  description,
  onClick
}: MetricCardProps) {
  const statusColorMap = {
    healthy: { bg: "rgba(34, 197, 94, 0.08)", text: "#16a34a", border: "rgba(34, 197, 94, 0.2)" },
    warning: { bg: "rgba(251, 146, 60, 0.08)", text: "#ea580c", border: "rgba(251, 146, 60, 0.2)" },
    critical: { bg: "rgba(239, 68, 68, 0.08)", text: "#dc2626", border: "rgba(239, 68, 68, 0.2)" }
  };

  const colors = statusColorMap[status];
  const trendDirection = trend?.direction === "up" ? "↑" : trend?.direction === "down" ? "↓" : "";
  const trendColor =
    trend?.direction === "up" ? "#16a34a" : trend?.direction === "down" ? "#dc2626" : "#64748b";

  return (
    <div
      className="metric-card"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.bg
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="metric-card__header">
        <div className="metric-card__label">{label}</div>
        {icon && <div className="metric-card__icon">{icon}</div>}
      </div>

      <div className="metric-card__value" style={{ color: colors.text }}>
        {value}
        {unit && <span className="metric-card__unit">{unit}</span>}
      </div>

      {trend && (
        <div className="metric-card__trend" style={{ color: trendColor }}>
          <span>{trendDirection}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}

      {description && <p className="metric-card__description">{description}</p>}
    </div>
  );
}
