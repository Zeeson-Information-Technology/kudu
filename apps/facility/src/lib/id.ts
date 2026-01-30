export const createKuduReferenceId = () => {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let random = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    random = Array.from(bytes)
      .map((byte) => alphabet[byte % alphabet.length])
      .join("");
  } else {
    for (let i = 0; i < 6; i += 1) {
      random += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `KUDU-${year}-${random}`;
};

export const createEncounterId = () => {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let random = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    random = Array.from(bytes)
      .map((byte) => alphabet[byte % alphabet.length])
      .join("");
  } else {
    for (let i = 0; i < 6; i += 1) {
      random += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `ENC-${year}-${random}`;
};

export const createLabOrderId = () => {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let random = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    random = Array.from(bytes)
      .map((byte) => alphabet[byte % alphabet.length])
      .join("");
  } else {
    for (let i = 0; i < 6; i += 1) {
      random += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `LAB-${year}-${random}`;
};

export const createPrescriptionId = () => {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let random = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    random = Array.from(bytes)
      .map((byte) => alphabet[byte % alphabet.length])
      .join("");
  } else {
    for (let i = 0; i < 6; i += 1) {
      random += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `RX-${year}-${random}`;
};

export const createQueueId = () => {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let random = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    random = Array.from(bytes)
      .map((byte) => alphabet[byte % alphabet.length])
      .join("");
  } else {
    for (let i = 0; i < 6; i += 1) {
      random += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `Q-${year}-${random}`;
};

export const createFacilityId = () => {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let random = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    random = Array.from(bytes)
      .map((byte) => alphabet[byte % alphabet.length])
      .join("");
  } else {
    for (let i = 0; i < 6; i += 1) {
      random += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `FAC-${year}-${random}`;
};

export const createUserId = () => {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let random = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    random = Array.from(bytes)
      .map((byte) => alphabet[byte % alphabet.length])
      .join("");
  } else {
    for (let i = 0; i < 6; i += 1) {
      random += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `USR-${year}-${random}`;
};

export const createJoinCode = (length = 8) => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    code = Array.from(bytes)
      .map((byte) => alphabet[byte % alphabet.length])
      .join("");
  } else {
    for (let i = 0; i < length; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  return code;
};

export const createAuditEventId = () => {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let random = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    random = Array.from(bytes)
      .map((byte) => alphabet[byte % alphabet.length])
      .join("");
  } else {
    for (let i = 0; i < 6; i += 1) {
      random += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `AUD-${year}-${random}`;
};

export const createDrugId = () => {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let random = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    random = Array.from(bytes)
      .map((byte) => alphabet[byte % alphabet.length])
      .join("");
  } else {
    for (let i = 0; i < 6; i += 1) {
      random += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `DRG-${year}-${random}`;
};
