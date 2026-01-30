"use client";

import { useCallback, useEffect, useState } from "react";
import { roleOptions, type Role } from "./types";

const ROLE_STORAGE_KEY = "kudu_facility_role";
const defaultRole: Role = "Clinician";
const listeners = new Set<(role: Role) => void>();

const isBrowser = typeof window !== "undefined";

const isValidRole = (value: string | null): value is Role =>
  !!value && roleOptions.includes(value as Role);

export const getStoredRole = (): Role => {
  if (!isBrowser) {
    return defaultRole;
  }

  const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
  return isValidRole(stored) ? stored : defaultRole;
};

export const setStoredRole = (role: Role) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  listeners.forEach((listener) => listener(role));
};

export const subscribeToRole = (listener: (role: Role) => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useRoleStore = () => {
  const [role, setRole] = useState<Role>(getStoredRole);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ROLE_STORAGE_KEY) {
        return;
      }

      setRole(isValidRole(event.newValue) ? event.newValue : defaultRole);
    };

    const unsubscribe = subscribeToRole(setRole);
    window.addEventListener("storage", handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateRole = useCallback((nextRole: Role) => {
    setRole(nextRole);
    setStoredRole(nextRole);
  }, []);

  return [role, updateRole] as const;
};
