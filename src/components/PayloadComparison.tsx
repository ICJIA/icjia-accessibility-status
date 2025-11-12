/**
 * @fileoverview PayloadComparison Component
 * Modal for comparing two API payloads side-by-side with difference highlighting.
 *
 * @module components/PayloadComparison
 */

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { api } from "../lib/api";

/**
 * Props for the PayloadComparison component
 * @typedef {Object} PayloadComparisonProps
 * @property {boolean} isOpen - Whether the modal is open
 * @property {Function} onClose - Callback to close the modal
 */
interface PayloadComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PayloadComparison Component
 *
 * Modal dialog for comparing two API payloads side-by-side. Features:
 * - Load payloads by UUID or ID
 * - Side-by-side JSON display
 * - Highlight differences between payloads
 * - Copy to clipboard functionality
 * - Error handling and loading states
 *
 * @component
 * @param {PayloadComparisonProps} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback when modal should close
 * @returns {React.ReactElement|null} The modal or null if not open
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * <PayloadComparison isOpen={isOpen} onClose={() => setIsOpen(false)} />
 */
export function PayloadComparison({ isOpen, onClose }: PayloadComparisonProps) {
  const [payload1Id, setPayload1Id] = useState("");
  const [payload2Id, setPayload2Id] = useState("");
  const [payload1Data, setPayload1Data] = useState<any>(null);
  const [payload2Data, setPayload2Data] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const loadPayload = async (id: string, isFirst: boolean) => {
    if (!id.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Try UUID first, then payload_id
      let response;
      try {
        response = await api.payloads.get(id);
      } catch {
        response = await api.payloads.getById(id);
      }

      if (isFirst) {
        setPayload1Data(response.payload);
      } else {
        setPayload2Data(response.payload);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load payload");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async (data: any, type: string) => {
    try {
      const jsonString = JSON.stringify(data.payload || data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const getDifferences = () => {
    if (!payload1Data || !payload2Data) return [];

    const p1 = payload1Data.payload || payload1Data;
    const p2 = payload2Data.payload || payload2Data;

    const differences: Array<{
      key: string;
      value1: any;
      value2: any;
      type: "changed" | "added" | "removed";
    }> = [];

    // Check all keys from both objects
    const allKeys = new Set([
      ...Object.keys(p1 || {}),
      ...Object.keys(p2 || {}),
    ]);

    allKeys.forEach((key) => {
      const v1 = p1?.[key];
      const v2 = p2?.[key];

      if (JSON.stringify(v1) !== JSON.stringify(v2)) {
        if (v1 === undefined) {
          differences.push({ key, value1: v1, value2: v2, type: "added" });
        } else if (v2 === undefined) {
          differences.push({ key, value1: v1, value2: v2, type: "removed" });
        } else {
          differences.push({ key, value1: v1, value2: v2, type: "changed" });
        }
      }
    });

    return differences;
  };

  const differences = getDifferences();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Compare Payloads
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Input Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payload 1 (UUID or ID):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={payload1Id}
                  onChange={(e) => setPayload1Id(e.target.value)}
                  placeholder="Enter UUID or payload ID"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => loadPayload(payload1Id, true)}
                  disabled={loading || !payload1Id.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
                >
                  Load
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payload 2 (UUID or ID):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={payload2Id}
                  onChange={(e) => setPayload2Id(e.target.value)}
                  placeholder="Enter UUID or payload ID"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => loadPayload(payload2Id, false)}
                  disabled={loading || !payload2Id.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
                >
                  Load
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Comparison View */}
          {payload1Data && payload2Data && (
            <div className="space-y-4">
              {/* Differences Summary */}
              {differences.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                    Found {differences.length} difference(s):
                  </p>
                  <div className="space-y-1">
                    {differences.map((diff, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-2 py-1 rounded ${
                          diff.type === "changed"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            : diff.type === "added"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                        }`}
                      >
                        <strong>{diff.key}</strong>: {diff.type}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Side-by-side Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Payload 1 */}
                <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Payload 1
                    </h3>
                    <button
                      onClick={() => handleCopyToClipboard(payload1Data, "p1")}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {copied === "p1" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto max-h-96 text-gray-800 dark:text-gray-200">
                    {JSON.stringify(
                      payload1Data.payload || payload1Data,
                      null,
                      2
                    )}
                  </pre>
                </div>

                {/* Payload 2 */}
                <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Payload 2
                    </h3>
                    <button
                      onClick={() => handleCopyToClipboard(payload2Data, "p2")}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {copied === "p2" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto max-h-96 text-gray-800 dark:text-gray-200">
                    {JSON.stringify(
                      payload2Data.payload || payload2Data,
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Loading payload...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
