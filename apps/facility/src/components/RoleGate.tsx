"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession } from "../lib/session";
import type { SessionData } from "../lib/session";

type RoleGateProps = {
  allowedRoles: SessionData["role"][];
  title?: string;
  message?: string;
  backHref?: string;
  children: React.ReactNode;
};

export function RoleGate({
  allowedRoles,
  title = "Access restricted",
  message = "You do not have permission to view this page.",
  backHref = "/dashboard",
  children
}: RoleGateProps) {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setStatus("denied");
      return;
    }
    if (allowedRoles.includes(session.role)) {
      setStatus("allowed");
    } else {
      setStatus("denied");
    }
  }, [allowedRoles]);

  if (status === "loading") {
    return null;
  }

  if (status === "denied") {
    return (
      <main aria-labelledby="access-title">
        <div className="card">
          <span className="tag">Restricted</span>
          <h2 id="access-title">{title}</h2>
          <p>{message}</p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href={backHref} className="button secondary table-action">
              <span className="icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
                  <path d="M9.5 3.5 5 8l4.5 4.5" />
                </svg>
              </span>
              Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
