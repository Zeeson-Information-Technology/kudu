"use client";

import { ReactNode } from "react";

interface DashboardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

/**
 * DashboardGrid - Responsive grid layout for dashboard sections
 * Automatically adjusts columns based on screen size
 *
 * Usage:
 * <DashboardGrid columns={3} gap="lg">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </DashboardGrid>
 */
export function DashboardGrid({ children, columns = 3, gap = "lg" }: DashboardGridProps) {
  const gapMap = {
    sm: "var(--spacing-sm)",
    md: "var(--spacing-md)",
    lg: "var(--spacing-lg)"
  };

  const gridTemplate = {
    1: "grid-template-columns: 1fr;",
    2: "grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));",
    3: "grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));",
    4: "grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));"
  };

  return (
    <div
      style={{
        display: "grid",
        gap: gapMap[gap],
        ...({} as any)
      }}
      className={`dashboard-grid dashboard-grid--${columns} dashboard-grid--gap-${gap}`}
    >
      {children}
    </div>
  );
}

interface DashboardSectionProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

/**
 * DashboardSection - Organized section with optional title and action
 *
 * Usage:
 * <DashboardSection
 *   title="Today's Metrics"
 *   action={<button>View All</button>}
 * >
 *   <MetricCard {...} />
 * </DashboardSection>
 */
export function DashboardSection({
  title,
  subtitle,
  action,
  children
}: DashboardSectionProps) {
  return (
    <section className="dashboard-section">
      {(title || subtitle || action) && (
        <div className="dashboard-section__header">
          <div className="dashboard-section__title-block">
            {title && <h2 className="section-heading">{title}</h2>}
            {subtitle && <p className="section-heading--subtitle">{subtitle}</p>}
          </div>
          {action && <div className="dashboard-section__action">{action}</div>}
        </div>
      )}
      <div className="dashboard-section__content">{children}</div>
    </section>
  );
}

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  metadata?: ReactNode;
}

/**
 * DashboardHeader - Premium header for dashboard pages
 *
 * Usage:
 * <DashboardHeader
 *   title="Facility Operations Dashboard"
 *   subtitle="Real-time insights into clinic activities"
 *   metadata={<span>{new Date().toLocaleDateString()}</span>}
 * />
 */
export function DashboardHeader({
  title,
  subtitle,
  icon,
  metadata
}: DashboardHeaderProps) {
  return (
    <div className="dashboard-header">
      <div className="dashboard-header__content">
        {icon && <div className="dashboard-header__icon">{icon}</div>}
        <div className="dashboard-header__text">
          <h1 className="dashboard-header__title">{title}</h1>
          {subtitle && <p className="dashboard-header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {metadata && <div className="dashboard-header__metadata">{metadata}</div>}
    </div>
  );
}

interface DashboardCardProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  noPadding?: boolean;
}

/**
 * DashboardCard - Premium card component for dashboard content
 *
 * Usage:
 * <DashboardCard title="Queue Status">
 *   <p>Content here</p>
 * </DashboardCard>
 */
export function DashboardCard({ title, children, footer, noPadding }: DashboardCardProps) {
  return (
    <div className={`card ${noPadding ? "card--no-padding" : ""}`}>
      {title && <h3 className="card__title">{title}</h3>}
      <div className="card__content">{children}</div>
      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );
}
