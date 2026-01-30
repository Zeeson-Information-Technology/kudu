// TODO: Replace local session storage with real authentication in Phase 3+.
export type SessionData = {
  facilityId: string;
  role: "admin" | "records" | "nurse" | "clinician" | "lab" | "pharmacy";
  displayName: string;
  userId: string;
};

const SESSION_KEY = "kudu.facility.session";

export const getSession = (): SessionData | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionData;
  } catch (error) {
    return null;
  }
};

export const setSession = (session: SessionData) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
};
