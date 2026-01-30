"use client";

import { ReactNode } from "react";

interface HealthStatusProps {
  status: "operational" | "degraded" | "offline" | "syncing";
  uptime?: string;
  lastSync?: string;
  actions?: ReactNode;
}

export function HealthStatus({ status, uptime, lastSync, actions }: HealthStatusProps) {
  const statusConfig = {
    operational: {
      label: "System Operational",
      color: "#16a34a",
      bgColor: "rgba(34, 197, 94, 0.1)",
      icon: "✓"
    },
    degraded: {
      label: "Degraded Performance",
      color: "#ea580c",
      bgColor: "rgba(251, 146, 60, 0.1)",
      icon: "⚠"
    },
    offline: {
      label: "Offline Mode",
      color: "#64748b",
      bgColor: "rgba(100, 116, 139, 0.1)",
      icon: "●"
    },
    syncing: {
      label: "Syncing",
      color: "#9333ea",
      bgColor: "rgba(147, 51, 234, 0.1)",
      icon: "↻"
    }
  };

  const config = statusConfig[status];

  return (
    <div className="health-status" style={{ backgroundColor: config.bgColor }}>
      <div className="health-status__content">
        <div className="health-status__indicator" style={{ color: config.color }}>
          <span className="health-status__icon">{config.icon}</span>
          <span className="health-status__label">{config.label}</span>
        </div>

        <div className="health-status__details">
          {uptime && <p>Uptime: {uptime}</p>}
          {lastSync && <p>Last sync: {lastSync}</p>}
        </div>
      </div>

      {actions && <div className="health-status__actions">{actions}</div>}
    </div>
  );
}
