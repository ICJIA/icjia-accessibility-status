/**
 * @fileoverview PayloadDetail Page
 * Detailed view of a single API payload with metadata and JSON display.
 *
 * @module pages/PayloadDetail
 */

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Key, Globe, User } from "lucide-react";
import { api } from "../lib/api";

/**
 * Represents detailed payload data
 * @typedef {Object} PayloadData
 * @property {string} id - Payload UUID
 * @property {string} payload_id - Payload ID
 * @property {any} payload - The actual payload JSON data
 * @property {number} payload_size - Size of the payload in bytes
 * @property {string|null} description - Optional description
 * @property {string} created_at - Creation timestamp
 * @property {string|null} created_by_user - Username of creator
 * @property {string|null} api_key_id - Associated API key ID
 * @property {string|null} ip_address - IP address of request
 * @property {string|null} user_agent - User agent of request
 * @property {Object|null} sites - Associated site information
 * @property {Object|null} admin_users - Associated admin user information
 * @property {Object|null} api_keys - Associated API key information
 */
interface PayloadData {
  id: string;
  payload_id: string;
  payload: any;
  payload_size: number;
  description: string | null;
  created_at: string;
  created_by_user: string | null;
  api_key_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  sites: { id: string; title: string; url: string } | null;
  admin_users: { username: string; email: string } | null;
  api_keys: { key_name: string; key_prefix: string; key_suffix: string } | null;
}

/**
 * PayloadDetail Page Component
 *
 * Displays detailed information about a specific API payload including:
 * - Full JSON payload display
 * - Metadata (creation date, creator, API key used)
 * - Request information (IP address, user agent)
 * - Associated site and user information
 * - Formatted JSON with syntax highlighting
 *
 * @component
 * @returns {React.ReactElement} The payload detail page
 *
 * @example
 * <Route path="/payloads/:uuid" element={<PayloadDetail />} />
 */
export function PayloadDetail() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [payload, setPayload] = useState<PayloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uuid) {
      loadPayload();
    }
  }, [uuid]);

  const loadPayload = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.payloads.get(uuid!);
      setPayload(response.payload);
    } catch (err: any) {
      console.error("Failed to load payload:", err);
      setError(err.message || "Failed to load payload");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">
          Loading payload...
        </div>
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
            Error Loading Payload
          </h2>
          <p className="text-red-700 dark:text-red-300">
            {error || "Payload not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 flex items-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          API Payload Details
        </h1>
      </div>

      {/* Metadata Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Metadata
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payload ID */}
          <div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
              <Key className="h-4 w-4" />
              <span className="text-sm font-medium">Payload ID</span>
            </div>
            <p className="font-mono text-sm text-gray-900 dark:text-white">
              {payload.payload_id}
            </p>
          </div>

          {/* Timestamp */}
          <div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Timestamp</span>
            </div>
            <p className="text-sm text-gray-900 dark:text-white">
              {new Date(payload.created_at).toLocaleString()}
            </p>
          </div>

          {/* API Key */}
          {payload.api_keys && (
            <div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                <Key className="h-4 w-4" />
                <span className="text-sm font-medium">API Key</span>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">
                {payload.api_keys.key_name}
              </p>
              <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                {payload.api_keys.key_prefix}...{payload.api_keys.key_suffix}
              </p>
            </div>
          )}

          {/* User */}
          {payload.admin_users && (
            <div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Created By</span>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">
                {payload.admin_users.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {payload.admin_users.email}
              </p>
            </div>
          )}

          {/* IP Address */}
          {payload.ip_address && (
            <div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">IP Address</span>
              </div>
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {payload.ip_address}
              </p>
            </div>
          )}

          {/* Payload Size */}
          <div>
            <div className="text-gray-600 dark:text-gray-400 mb-1">
              <span className="text-sm font-medium">Payload Size</span>
            </div>
            <p className="text-sm text-gray-900 dark:text-white">
              {formatFileSize(payload.payload_size)}
            </p>
          </div>
        </div>

        {/* Description */}
        {payload.description && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Description
            </h3>
            <p className="text-gray-900 dark:text-white">
              {payload.description}
            </p>
          </div>
        )}

        {/* User Agent */}
        {payload.user_agent && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              User Agent
            </h3>
            <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
              {payload.user_agent}
            </p>
          </div>
        )}

        {/* Associated Site */}
        {payload.sites && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Associated Site
            </h3>
            <Link
              to={`/admin/sites/${payload.sites.id}`}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {payload.sites.title}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {payload.sites.url}
            </p>
          </div>
        )}
      </div>

      {/* Payload Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Payload Content
        </h2>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-800 dark:text-gray-200">
            {JSON.stringify(payload.payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
