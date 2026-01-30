"use client";

import { ReactNode } from "react";

interface ActivityItem {
  id: string;
  label: string;
  time: string;
  type: "patient" | "encounter" | "lab" | "sync" | "alert";
  href?: string;
}

interface ActivityCardProps {
  title: string;
  items: ActivityItem[];
  icon?: ReactNode;
  viewAllHref?: string;
}

const activityTypeColors = {
  patient: { bg: "#e0f2fe", text: "#0284c7", icon: "👤" },
  encounter: { bg: "#fef3c7", text: "#d97706", icon: "📋" },
  lab: { bg: "#f0fdf4", text: "#16a34a", icon: "🧪" },
  sync: { bg: "#f3e8ff", text: "#9333ea", icon: "🔄" },
  alert: { bg: "#fecaca", text: "#dc2626", icon: "⚠️" }
};

export function ActivityCard({ title, items, icon, viewAllHref }: ActivityCardProps) {
  return (
    <div className="activity-card">
      <div className="activity-card__header">
        <h3 className="activity-card__title">{title}</h3>
        {icon && <div className="activity-card__icon">{icon}</div>}
      </div>

      <ul className="activity-list">
        {items.length > 0 ? (
          items.map((item) => {
            const colors = activityTypeColors[item.type];
            return (
              <li key={item.id} className="activity-item">
                <div className="activity-item__badge" style={{ backgroundColor: colors.bg }}>
                  <span style={{ color: colors.text }}>{colors.icon}</span>
                </div>
                <div className="activity-item__content">
                  {item.href ? (
                    <a className="activity-item__label" href={item.href}>
                      {item.label}
                    </a>
                  ) : (
                    <p className="activity-item__label">{item.label}</p>
                  )}
                  {item.time ? <p className="activity-item__time">{item.time}</p> : null}
                </div>
              </li>
            );
          })
        ) : (
          <li className="activity-item--empty">No recent activity</li>
        )}
      </ul>

      {viewAllHref && (
        <a href={viewAllHref} className="activity-card__link">
          View all →
        </a>
      )}
    </div>
  );
}
