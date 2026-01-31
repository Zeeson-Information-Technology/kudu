"use client";

import { StatsGrid } from "../../../src/components/StatsGrid";
import { MetricCard } from "../../../src/components/MetricCard";
import { RoleGate } from "../../../src/components/RoleGate";

export default function AdminPage() {
  const adminStats = [
    {
      id: "1",
      title: "Registered Users",
      value: "12",
      metadata: "Active staff",
      icon: "👨‍⚕️"
    },
    {
      id: "2",
      title: "System Storage",
      value: "6.7 GB",
      metadata: "Of 10 GB total",
      icon: "💾"
    },
    {
      id: "3",
      title: "Audit Logs",
      value: "1,847",
      metadata: "Records indexed",
      icon: "📋"
    },
    {
      id: "4",
      title: "Backup Status",
      value: "✓ Latest",
      metadata: "2 hours ago",
      icon: "✓"
    }
  ];

  const auditMetrics = [
    {
      label: "Audit Trail Completeness",
      value: "100%",
      status: "healthy" as const,
      description: "All actions logged and immutable"
    },
    {
      label: "Access Control Enforced",
      value: "100%",
      status: "healthy" as const,
      description: "Role-based access active"
    },
    {
      label: "Data Encryption",
      value: "✓ Active",
      status: "healthy" as const,
      description: "AES-256 at rest and in transit"
    },
    {
      label: "Backup Frequency",
      value: "Every 4h",
      status: "healthy" as const,
      description: "Automated with verification"
    }
  ];

  return (
    <RoleGate
      allowedRoles={["admin"]}
      title="Admin access required"
      message="Only facility admins can access administration settings."
    >
    <main className="dashboard-page" aria-labelledby="admin-title">
      <div className="dashboard-header">
        <div className="dashboard-header__content">
          <h1 id="admin-title" className="dashboard-header__title">
            Facility Administration
          </h1>
          <p className="dashboard-header__subtitle">
            System configuration, access control, and audit logs
          </p>
        </div>
      </div>

      {/* Admin Statistics */}
      <div className="dashboard-section">
        <StatsGrid stats={adminStats} columns={4} />
      </div>

      {/* Security & Audit Metrics */}
      <div className="dashboard-section">
        <h2 className="section-heading">Security & Compliance</h2>
        <div className="metrics-grid">
          {auditMetrics.map((metric, idx) => (
            <MetricCard key={idx} {...metric} />
          ))}
        </div>
      </div>

      {/* User Management */}
      <div className="dashboard-section">
        <h2 className="section-heading">User Management</h2>
        <div className="card">
          <h3 className="card__title">Staff & Access</h3>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Last Access</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Dr. Adekunle Oluwaseun</td>
                  <td><span className="role-badge">Facility Head</span></td>
                  <td>Today, 9:30 AM</td>
                  <td><button className="button secondary small table-action">Edit</button></td>
                </tr>
                <tr>
                  <td>Nurse Chisom Ejiofor</td>
                  <td><span className="role-badge">Nurse</span></td>
                  <td>Today, 8:15 AM</td>
                  <td><button className="button secondary small table-action">Edit</button></td>
                </tr>
                <tr>
                  <td>Chidi Obi</td>
                  <td><span className="role-badge">Pharmacist</span></td>
                  <td>Yesterday, 5:45 PM</td>
                  <td><button className="button secondary small table-action">Edit</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="dashboard-section">
        <h2 className="section-heading">System Configuration</h2>
        <div className="dashboard-grid-2">
          <div className="card">
            <h3 className="card__title">Facility Settings</h3>
            <div className="settings-list">
              <div className="setting-item">
                <label className="setting-label">Facility Name</label>
                <p className="setting-value">Kudu Primary Health Centre, Kaduna</p>
              </div>
              <div className="setting-item">
                <label className="setting-label">Registration Date</label>
                <p className="setting-value">January 2024</p>
              </div>
              <div className="setting-item">
                <label className="setting-label">License Number</label>
                <p className="setting-value">KD-2024-001234</p>
              </div>
            </div>
            <button className="button secondary table-action">Edit Settings</button>
          </div>

          <div className="card">
            <h3 className="card__title">Sync Configuration</h3>
            <div className="settings-list">
              <div className="setting-item">
                <label className="setting-label">Sync Interval</label>
                <p className="setting-value">Every 15 minutes (when online)</p>
              </div>
              <div className="setting-item">
                <label className="setting-label">Data Retention</label>
                <p className="setting-value">30 days local, 5 years archived</p>
              </div>
              <div className="setting-item">
                <label className="setting-label">Encryption</label>
                <p className="setting-value">AES-256 at rest and in transit</p>
              </div>
            </div>
            <button className="button secondary table-action">Configure Sync</button>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="dashboard-section">
        <h2 className="section-heading">Recent System Events</h2>
        <div className="card">
          <div className="audit-log">
            {[
              { time: "Today, 10:45 AM", action: "Data sync completed", user: "System" },
              { time: "Today, 10:30 AM", action: "New patient registered", user: "Nurse Chisom" },
              { time: "Today, 9:15 AM", action: "Lab results imported", user: "System" },
              { time: "Yesterday, 5:00 PM", action: "Daily backup completed", user: "System" },
              { time: "Yesterday, 2:30 PM", action: "User access permission updated", user: "Dr. Adekunle" }
            ].map((event, idx) => (
              <div key={idx} className="audit-log-entry">
                <div className="audit-log-time">{event.time}</div>
                <div className="audit-log-action">{event.action}</div>
                <div className="audit-log-user">{event.user}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="dashboard-section">
        <h2 className="section-heading">Administration</h2>
        <div className="quick-actions">
          <button className="button secondary table-action">Manage Users</button>
          <button className="button secondary table-action">Configure Alerts</button>
          <button className="button secondary table-action">Export Audit Log</button>
          <button className="button secondary table-action">System Maintenance</button>
        </div>
      </div>
    </main>
    </RoleGate>
  );
}
