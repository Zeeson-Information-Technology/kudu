"use client";

import { ReactNode } from "react";

interface StatItem {
  id: string;
  title: string;
  value: string | number;
  metadata?: string;
  icon?: ReactNode;
  href?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  title?: string;
}

export function StatsGrid({ stats, columns = 4, title }: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4"
  };

  return (
    <div className="stats-section">
      {title && <h3 className="stats-section__title">{title}</h3>}
      <div className={`stats-grid stats-grid--${columns}`}>
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="stat-item"
            onClick={() => {
              const href = stat.href;
              if (!href) {
                return;
              }
              window.location.href = href;
            }}
          >
            {stat.icon && <div className="stat-item__icon">{stat.icon}</div>}
            <p className="stat-item__title">{stat.title}</p>
            <p className="stat-item__value">{stat.value}</p>
            {stat.metadata && <p className="stat-item__metadata">{stat.metadata}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
