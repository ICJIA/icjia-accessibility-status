/**
 * @fileoverview Health Page
 * System health status page showing backend, database, and service health.
 * Displays detailed health metrics and allows manual health checks.
 *
 * @module pages/Health
 */

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

/**
 * Response from health check endpoint
 * @typedef {Object} HealthCheckResponse
 * @property {'healthy'|'degraded'|'unhealthy'} status - Overall system status
 * @property {string} timestamp - Health check timestamp
 * @property {Object} backend - Backend service status
 * @property {Object} database - Database status
 */
interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  backend: {
    status: string;
    uptime: number;
    nodeVersion: string;
    environment: string;
  };
  database: {
    status: string;
    supabaseUrl: string;
    tables: {
      [key: string]: {
        status: string;
        error?: string;
        responseTime: number;
      };
    };
    error?: string;
  };
  checks: Array<{
    name: string;
    status: "pass" | "fail";
    error?: string;
  }>;
  responseTime: number;
}

export default function Health() {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealthStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.health.check();
      setHealthData(data);
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch health status");
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "ok":
      case "pass":
      case "connected":
      case "running":
        return (
          <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
        );
      case "degraded":
      case "partial":
        return (
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
        );
      case "unhealthy":
      case "fail":
      case "error":
      case "disconnected":
        return (
          <XCircleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />
        );
      default:
        return (
          <ExclamationTriangleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "ok":
      case "pass":
      case "connected":
      case "running":
        return "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20";
      case "degraded":
      case "partial":
        return "text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20";
      case "unhealthy":
      case "fail":
      case "error":
      case "disconnected":
        return "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
  };

  if (loading && !healthData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-500 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Checking system health...
          </p>
        </div>
      </div>
    );
  }

  if (error && !healthData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <XCircleIcon className="h-8 w-8 text-red-500 dark:text-red-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Health Check Failed
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchHealthStatus}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                System Health Check
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Real-time status of backend API and database connectivity
              </p>
            </div>
            <button
              onClick={fetchHealthStatus}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon
                className={`h-5 w-5 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
          {lastChecked && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Last checked: {lastChecked.toLocaleString()}
            </p>
          )}
        </div>

        {healthData && (
          <>
            {/* Overall Status */}
            <div
              className={`mb-6 p-6 rounded-lg border-2 ${
                healthData.status === "healthy"
                  ? "border-green-500 dark:border-green-400"
                  : healthData.status === "degraded"
                  ? "border-yellow-500 dark:border-yellow-400"
                  : "border-red-500 dark:border-red-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(healthData.status)}
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      System Status:{" "}
                      <span
                        className={`${
                          healthData.status === "healthy"
                            ? "text-green-600 dark:text-green-400"
                            : healthData.status === "degraded"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {healthData.status.toUpperCase()}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Response time: {healthData.responseTime}ms
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Backend Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                {getStatusIcon(healthData.backend.status)}
                <h3 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                  Backend API
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <p
                    className={`text-lg font-semibold ${getStatusColor(
                      healthData.backend.status
                    )} px-3 py-1 rounded inline-block`}
                  >
                    {healthData.backend.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Uptime
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatUptime(healthData.backend.uptime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Node Version
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {healthData.backend.nodeVersion}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Environment
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {healthData.backend.environment}
                  </p>
                </div>
              </div>
            </div>

            {/* Database Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                {getStatusIcon(healthData.database.status)}
                <h3 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                  Database (Supabase)
                </h3>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Overall Status
                </p>
                <p
                  className={`text-lg font-semibold ${getStatusColor(
                    healthData.database.status
                  )} px-3 py-1 rounded inline-block`}
                >
                  {healthData.database.status}
                </p>
              </div>
              {healthData.database.error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Error:
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {healthData.database.error}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(healthData.database.tables).map(
                  ([tableName, tableStatus]) => (
                    <div
                      key={tableName}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(tableStatus.status)}
                          <p className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {tableName}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {tableStatus.responseTime}ms
                        </span>
                      </div>
                      {tableStatus.error && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                          {tableStatus.error}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Detailed Checks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Detailed Checks
              </h3>
              <div className="space-y-2">
                {healthData.checks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      {getStatusIcon(check.status)}
                      <span className="ml-3 text-gray-900 dark:text-white">
                        {check.name.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    {check.error && (
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {check.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
