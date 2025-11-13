import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, AlertCircle } from "lucide-react";
import { ScanViolation } from "../types";
import { api } from "../lib/api";
import { useTheme } from "../contexts/ThemeContext";

export function ScanReport() {
  const { siteId, scanId } = useParams<{ siteId: string; scanId: string }>();
  const [violations, setViolations] = useState<ScanViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [wcagFilter, setWcagFilter] = useState<"all" | "AA" | "AAA">("AA");
  const [impactFilter, setImpactFilter] = useState<"all" | "critical" | "serious" | "moderate" | "minor">("all");
  const [pageUrlFilter, setPageUrlFilter] = useState<string>("");
  const { isDark } = useTheme();

  useEffect(() => {
    if (scanId) {
      loadViolations();
    }
  }, [scanId]);

  const loadViolations = async () => {
    try {
      setLoading(true);
      // This endpoint will be created in the backend
      const response = await fetch(`/api/scans/${scanId}/violations`);
      if (response.ok) {
        const data = await response.json();
        setViolations(data.violations || []);
      }
    } catch (error) {
      console.error("Failed to load violations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case "critical":
        return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200";
      case "serious":
        return "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-900 dark:text-orange-200";
      case "moderate":
        return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-200";
      case "minor":
        return "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200";
    }
  };

  const getImpactBadgeColor = (impact: string): string => {
    switch (impact) {
      case "critical":
        return "bg-red-600 text-white";
      case "serious":
        return "bg-orange-600 text-white";
      case "moderate":
        return "bg-yellow-600 text-white";
      case "minor":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const filteredViolations = violations.filter((v) => {
    if (wcagFilter !== "all" && v.wcag_level !== wcagFilter) return false;
    if (impactFilter !== "all" && v.impact_level !== impactFilter) return false;
    if (pageUrlFilter && !v.page_url.includes(pageUrlFilter)) return false;
    return true;
  });

  const groupedByPage = filteredViolations.reduce(
    (acc, v) => {
      if (!acc[v.page_url]) {
        acc[v.page_url] = [];
      }
      acc[v.page_url].push(v);
      return acc;
    },
    {} as Record<string, ScanViolation[]>
  );

  const uniquePageUrls = Array.from(new Set(violations.map((v) => v.page_url)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        <Link
          to={`/sites/${siteId}`}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Site</span>
        </Link>

        <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-lg p-8 border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            Accessibility Violation Report
          </h1>
          <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Found {filteredViolations.length} violation{filteredViolations.length !== 1 ? "s" : ""} across {Object.keys(groupedByPage).length} page{Object.keys(groupedByPage).length !== 1 ? "s" : ""}
          </p>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                WCAG Level
              </label>
              <select
                value={wcagFilter}
                onChange={(e) => setWcagFilter(e.target.value as any)}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Levels</option>
                <option value="AA">AA Only</option>
                <option value="AAA">AAA Only</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Impact Level
              </label>
              <select
                value={impactFilter}
                onChange={(e) => setImpactFilter(e.target.value as any)}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Levels</option>
                <option value="critical">Critical</option>
                <option value="serious">Serious</option>
                <option value="moderate">Moderate</option>
                <option value="minor">Minor</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Page URL
              </label>
              <input
                type="text"
                value={pageUrlFilter}
                onChange={(e) => setPageUrlFilter(e.target.value)}
                placeholder="Filter by page URL..."
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Violations by Page */}
          <div className="space-y-6">
            {Object.entries(groupedByPage).map(([pageUrl, pageViolations]) => (
              <div key={pageUrl} className={`border rounded-lg p-4 ${isDark ? "border-gray-700 bg-gray-700/50" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-4">
                  <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="truncate">{pageUrl}</span>
                  </a>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? "bg-gray-600 text-gray-200" : "bg-gray-200 text-gray-800"}`}>
                    {pageViolations.length} violation{pageViolations.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3">
                  {pageViolations.map((violation) => (
                    <div key={violation.id} className={`p-3 rounded border ${getImpactColor(violation.impact_level)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{violation.rule_name}</h4>
                          <p className="text-sm opacity-90">{violation.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactBadgeColor(violation.impact_level)}`}>
                            {violation.impact_level}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? "bg-gray-600 text-gray-200" : "bg-gray-300 text-gray-800"}`}>
                            WCAG {violation.wcag_level}
                          </span>
                        </div>
                      </div>
                      {violation.suggested_fix && (
                        <p className="text-sm mt-2 opacity-90">
                          <strong>Fix:</strong> {violation.suggested_fix}
                        </p>
                      )}
                      {violation.help_url && (
                        <a
                          href={violation.help_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs opacity-75 hover:opacity-100 underline"
                        >
                          Learn more →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredViolations.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className={`h-12 w-12 mx-auto mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                No violations found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

