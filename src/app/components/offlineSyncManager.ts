"use client";
import React, { useEffect, useState } from "react";
import { pushOutbox } from "@/lib/syncManager";

interface SyncManagerProps {
  userId?: string;
  syncInterval?: number; // ms between auto-syncs
}

export const OfflineSyncManager: React.FC<SyncManagerProps> = ({
  userId,
  syncInterval = 10000, // 10 seconds default
}) => {
  const [stats, setStats] = useState({
    totalSyncs: 0,
    failedSyncs: 0,
    lastError: null as string | null,
  });

  useEffect(() => {
    let syncTimer: NodeJS.Timeout;
    let pullTimer: NodeJS.Timeout;
    let isActive = true;

    const performSync = async () => {
      if (!navigator.onLine || !isActive) return;

      try {
        // Push local changes to server
        await pushOutbox();
        
        // Pull updates from server
        if (userId) {
          await pullFromServer(userId);
        }

        setStats((prev) => ({
          ...prev,
          totalSyncs: prev.totalSyncs + 1,
          lastError: null,
        }));
      } catch (error) {
        console.error("Auto-sync failed:", error);
        setStats((prev) => ({
          ...prev,
          failedSyncs: prev.failedSyncs + 1,
          lastError: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    };

    // Initial sync
    performSync();

    // Set up periodic sync
    syncTimer = setInterval(performSync, syncInterval);

    // Handle online/offline events
    const handleOnline = () => {
      console.log("Back online - syncing...");
      performSync();
    };

    const handleOffline = () => {
      console.log("Gone offline - will sync when back online");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Handle visibility change (sync when tab becomes visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        performSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive = false;
      clearInterval(syncTimer);
      clearInterval(pullTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId, syncInterval]);

  // This component doesn't render anything visible
  return null;
};
