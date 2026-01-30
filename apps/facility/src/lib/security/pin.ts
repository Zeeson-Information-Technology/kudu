export const hashPin = async (pin: string) => {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // TODO: Replace with a stronger hash utility when available server-side.
  let hash = 0;
  for (let i = 0; i < pin.length; i += 1) {
    hash = (hash << 5) - hash + pin.charCodeAt(i);
    hash |= 0;
  }
  return `fallback_${Math.abs(hash)}`;
};

export const verifyPin = async (pin: string, hash?: string) => {
  if (!hash) {
    return false;
  }
  const nextHash = await hashPin(pin);
  return nextHash === hash;
};
