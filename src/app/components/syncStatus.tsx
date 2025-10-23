"use client";
import React, { useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw, WifiOff, CheckCircle, AlertCircle } from "lucide-react";
import { db } from "@/lib/dexieClient";
import { pushOutbox } from "@/lib/syncManager";

export const SyncStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();

    // Check pending changes periodically
    const checkPending = async () => {
      const count = await db.outbox.count();
      setPendingChanges(count);
    };

    checkPending();
    const pendingInterval = setInterval(checkPending, 2000);

    // Load last sync time from localStorage
    const storedSync = localStorage.getItem("lastSyncTime");
    if (storedSync) {
      setLastSync(new Date(storedSync));
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      clearInterval(pendingInterval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      setSyncError("Cannot sync while offline");
      setTimeout(() => setSyncError(null), 3000);
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      await pushOutbox();
      const now = new Date();
      setLastSync(now);
      localStorage.setItem("lastSyncTime", now.toISOString());
      setPendingChanges(await db.outbox.count());
    } catch (error) {
      setSyncError("Sync failed. Will retry automatically.");
      console.error("Manual sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return "Never synced";
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return lastSync.toLocaleDateString();
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CloudOff className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Offline</span>
            </div>
          )}

          <div className="text-sm text-slate-400">
            {formatLastSync()}
          </div>

          {pendingChanges > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-600/20 rounded text-amber-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{pendingChanges} pending</span>
            </div>
          )}

          {pendingChanges === 0 && isOnline && (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Synced</span>
            </div>
          )}
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing || !isOnline}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Sync now"
        >
          <RefreshCw
            className={`w-5 h-5 text-slate-300 ${isSyncing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {syncError && (
        <div className="mt-3 p-2 bg-red-600/20 rounded text-red-400 text-sm">
          {syncError}
        </div>
      )}

      {!isOnline && (
        <div className="mt-3 p-2 bg-amber-600/20 rounded text-amber-400 text-sm flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>Working offline. Changes will sync when back online.</span>
        </div>
      )}
    </div>
  );
};