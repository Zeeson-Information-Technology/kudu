"use client";

import { useEffect, useState } from "react";
import { startSync, subscribeToSync, type SyncSnapshot } from "./db";

const defaultSnapshot: SyncSnapshot = {
  status: "idle",
  hasConflicts: false
};

let currentSnapshot = defaultSnapshot;

const updateSnapshot = (snapshot: SyncSnapshot) => {
  currentSnapshot = snapshot;
};

export const useSyncStatus = () => {
  const [snapshot, setSnapshot] = useState<SyncSnapshot>(currentSnapshot);

  useEffect(() => {
    const unsubscribe = subscribeToSync((next) => {
      updateSnapshot(next);
      setSnapshot(next);
    });

    startSync();

    return () => {
      unsubscribe();
    };
  }, []);

  return snapshot;
};
