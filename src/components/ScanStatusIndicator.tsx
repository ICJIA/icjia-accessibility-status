/**
 * @fileoverview ScanStatusIndicator Component
 * Real-time status indicator for ongoing scans with animated progress.
 *
 * @module components/ScanStatusIndicator
 */

import { Scan } from "../types";
import { CheckCircle, AlertCircle, Zap } from "lucide-react";

interface ScanStatusIndicatorProps {
  scans: Scan[];
  isRunning: boolean;
}

/**
 * ScanStatusIndicator Component
 *
 * Displays a real-time status indicator for scans with:
 * - Animated pulse for pending/running scans
 * - Progress indicators for Lighthouse and Axe
 * - Success/failure states
 * - No page refresh, smooth animations
 *
 * @component
 * @param {ScanStatusIndicatorProps} props - Component props
 * @param {Scan[]} props.scans - Array of scans
 * @param {boolean} props.isRunning - Whether a scan is currently running
 * @returns {React.ReactElement | null} The status indicator or null if no active scans
 */
export function ScanStatusIndicator({
  scans,
  isRunning,
}: ScanStatusIndicatorProps) {
  if (!isRunning || !scans || scans.length === 0) {
    return null;
  }

  // Get the most recent scan
  const latestScan = scans[0];

  if (!latestScan || (latestScan.status !== "pending" && latestScan.status !== "running")) {
    return null;
  }

  const isLighthouseDone = latestScan.lighthouse_score !== null;
  const isAxeDone = latestScan.axe_score !== null;
  const isPending = latestScan.status === "pending";

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Animated pulse indicator */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse opacity-75"></div>
            <div className="relative w-4 h-4 bg-blue-600 rounded-full"></div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {isPending ? "Preparing scan..." : "Scan in progress"}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {isPending
                ? "Initializing accessibility scan..."
                : "Running Lighthouse and Axe analysis..."}
            </p>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex items-center space-x-6">
          {/* Lighthouse indicator */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-1">
              {isLighthouseDone ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
              )}
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Lighthouse
              </span>
            </div>
            {isLighthouseDone && (
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                {latestScan.lighthouse_score}/100
              </span>
            )}
          </div>

          {/* Axe indicator */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-1">
              {isAxeDone ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
              )}
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Axe
              </span>
            </div>
            {isAxeDone && (
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                {latestScan.axe_score}/100
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
          style={{
            width: `${
              isPending ? 25 : isLighthouseDone && isAxeDone ? 100 : 60
            }%`,
          }}
        ></div>
      </div>
    </div>
  );
}

