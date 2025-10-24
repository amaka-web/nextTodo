"use client";
import React, { useEffect } from "react";
import { pushOutbox, pullServer } from "@/lib/syncManager"; // Fixed: pullServer instead of pullFromServer

interface SyncManagerProps {
  userId?: string;
  syncInterval?: number; // ms between auto-syncs
}

export const OfflineSyncManager: React.FC<SyncManagerProps> = ({
  userId,
  syncInterval = 10000, // 10 seconds default
}) => {
  useEffect(() => {
    let syncTimer: NodeJS.Timeout | null = null;
    let isActive = true;

    const performSync = async () => {
      if (!navigator.onLine || !isActive) return;

      try {
        // Push local changes to server
        await pushOutbox();
        
        // Pull updates from server
        await pullServer();
      } catch (error) {
        console.error("Auto-sync failed:", error);
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
      if (syncTimer) clearInterval(syncTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId, syncInterval]);

  // This component doesn't render anything visible
  return null;
};