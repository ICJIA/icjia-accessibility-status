/**
 * @fileoverview Payloads Page
 * List view of all API payloads with filtering, searching, and export capabilities.
 *
 * @module pages/Payloads
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Search,
  Filter,
  Calendar,
  Globe,
  Download,
} from "lucide-react";
import { api } from "../lib/api";

/**
 * Represents a payload in the list
 * @typedef {Object} Payload
 * @property {string} id - Payload UUID
 * @property {string} payload_id - Payload ID
 * @property {string|null} description - Optional description
 * @property {number} payload_size - Size in bytes
 * @property {string} created_at - Creation timestamp
 * @property {string} site_id - Associated site ID
 * @property {Object|null} sites - Associated site information
 */
interface Payload {
  id: string;
  payload_id: string;
  description: string | null;
  payload_size: number;
  created_at: string;
  site_id: string;
  sites: { id: string; title: string; url: string } | null;
}

/**
 * Payloads Page Component
 *
 * Displays a list of all API payloads with:
 * - Search by payload ID or description
 * - Filter by site
 * - Filter by date range
 * - Pagination
 * - Export to CSV
 * - Links to detailed payload views
 *
 * @component
 * @returns {React.ReactElement} The payloads list page
 *
 * @example
 * <Route path="/payloads" element={<Payloads />} />
 */
export function Payloads() {
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    loadPayloads();
  }, [limit]);

  const loadPayloads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.payloads.list(limit, 0);
      setPayloads(response.payloads || []);
    } catch (err: any) {
      console.error("Failed to load payloads:", err);
      setError(err.message || "Failed to load payloads");
    } finally {
      setLoading(false);
    }
  };

  // Get unique sites for filter dropdown
  const uniqueSites = Array.from(
    new Map(
      payloads.filter((p) => p.sites).map((p) => [p.sites!.id, p.sites!])
    ).values()
  ).sort((a, b) => a.title.localeCompare(b.title));

  // Filter payloads
  const filteredPayloads = payloads.filter((payload) => {
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        payload.payload_id,
        payload.description,
        payload.sites?.title,
        payload.sites?.url,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) return false;
    }

    // Filter by site
    if (selectedSite && payload.site_id !== selectedSite) {
      return false;
    }

    // Filter by date range
    if (startDate || endDate) {
      const payloadDate = new Date(payload.created_at);
      if (startDate) {
        const start = new Date(startDate);
        if (payloadDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (payloadDate > end) return false;
      }
    }

    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const exportAsJSON = () => {
    const dataToExport = filteredPayloads.map((p) => ({
      id: p.id,
      payload_id: p.payload_id,
      description: p.description,
      size: p.payload_size,
      created_at: p.created_at,
      site: p.sites?.title,
    }));

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payloads-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="h-8 w-8" />
          API Payloads
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage all API payload uploads
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by payload ID, description, or site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Site Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site:
            </label>
            <select
              value={selectedSite || ""}
              onChange={(e) => setSelectedSite(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Sites</option>
              {uniqueSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Clear & Export */}
          <div className="flex gap-2 pt-2 border-t border-gray-300 dark:border-gray-600">
            {(searchQuery || selectedSite || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSite(null);
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={exportAsJSON}
              disabled={filteredPayloads.length === 0}
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
            >
              <Download className="h-3 w-3" />
              Export JSON
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          Loading payloads...
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : filteredPayloads.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No payloads found
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Payload ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayloads.map((payload) => (
                <tr
                  key={payload.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/payloads/${payload.id}`}
                      className="font-mono text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {payload.payload_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {payload.sites ? (
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {payload.sites.title}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {payload.description || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(payload.payload_size)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(payload.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
