"use client";

import { roleOptions } from "../lib/types";
import { useRoleStore } from "../lib/role-store";

export default function RoleSwitcher() {
  const [role, setRole] = useRoleStore();

  return (
    <>
      {/* TODO: Replace dev-only role switcher with authenticated role from session. */}
      <label className="role-select" htmlFor="role-select">
      Role
      <select
        id="role-select"
        name="role-select"
        value={role}
        onChange={(event) => setRole(event.target.value as typeof role)}
      >
        {roleOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="role-select__note">DEV ONLY</span>
      </label>
    </>
  );
}
