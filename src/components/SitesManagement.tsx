/**
 * @fileoverview Sites Management Component
 * Displays a table of all sites with edit/delete actions, scores, and scan counts.
 *
 * @module components/SitesManagement
 */

import { useState, useEffect } from "react";
import { Edit2, Trash2, AlertCircle } from "lucide-react";
import { Site } from "../types";
import { api } from "../lib/api";
import { ScoreBadge } from "./ScoreBadge";

interface SitesManagementProps {
  onEdit: (site: Site) => void;
  onDelete: (site: Site) => void;
  onRefresh: () => void;
}

export function SitesManagement({
  onEdit,
  onDelete,
  onRefresh,
}: SitesManagementProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanCounts, setScanCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const response = await api.sites.list();
      setSites(response.sites || []);

      // Load scan counts for each site
      const counts: Record<string, number> = {};
      for (const site of response.sites || []) {
        try {
          const scansResponse = await api.sites.getScans(site.id);
          counts[site.id] = (scansResponse.scans || []).length;
        } catch (error) {
          console.error(`Failed to load scans for site ${site.id}:`, error);
          counts[site.id] = 0;
        }
      }
      setScanCounts(counts);
    } catch (error) {
      console.error("Failed to load sites:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Loading sites...</p>
      </div>
    );
  }

  if (!sites || sites.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">No sites yet.</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Click "Add Site" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
              Site Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
              URL
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
              Axe Score
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
              Lighthouse Score
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
              Scans Run
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {sites.map((site) => (
            <tr
              key={site.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                {site.title}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-xs">
                {site.url}
              </td>
              <td className="px-4 py-3 text-center">
                <ScoreBadge score={site.axe_score} size="sm" />
              </td>
              <td className="px-4 py-3 text-center">
                <ScoreBadge score={site.lighthouse_score} size="sm" />
              </td>
              <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                {scanCounts[site.id] || 0}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(site)}
                    className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="Edit site"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(site)}
                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Delete site"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

