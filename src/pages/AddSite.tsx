import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useTheme } from "../contexts/ThemeContext";

export function AddSite() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    sitemap_url: "",
    documentation_url: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate required fields
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.url.trim()
    ) {
      setError("Title, description, and URL are required");
      return;
    }

    // Validate URLs
    if (!validateUrl(formData.url)) {
      setError("Invalid site URL format");
      return;
    }

    if (formData.sitemap_url && !validateUrl(formData.sitemap_url)) {
      setError("Invalid sitemap URL format");
      return;
    }

    if (
      formData.documentation_url &&
      !validateUrl(formData.documentation_url)
    ) {
      setError("Invalid documentation URL format");
      return;
    }

    setLoading(true);

    try {
      const response = await api.sites.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        url: formData.url.trim(),
        sitemap_url: formData.sitemap_url.trim() || null,
        documentation_url: formData.documentation_url.trim() || null,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/sites/${response.site.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create site");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      } py-12 px-4`}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className={`${
            isDark ? "bg-gray-800" : "bg-white"
          } rounded-lg shadow-lg p-8`}
        >
          <h1
            className={`text-3xl font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Add New Site
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Site created successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Site Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Illinois Department of Justice"
                className={`w-full px-4 py-2 rounded border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Site Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the site and its purpose"
                rows={4}
                className={`w-full px-4 py-2 rounded border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Site URL *
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.illinois.gov"
                className={`w-full px-4 py-2 rounded border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Sitemap URL
              </label>
              <input
                type="url"
                name="sitemap_url"
                value={formData.sitemap_url}
                onChange={handleChange}
                placeholder="https://example.illinois.gov/sitemap.xml"
                className={`w-full px-4 py-2 rounded border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Optional. Used for comprehensive accessibility scanning.
              </p>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Documentation URL
              </label>
              <input
                type="url"
                name="documentation_url"
                value={formData.documentation_url}
                onChange={handleChange}
                placeholder="https://example.illinois.gov/docs"
                className={`w-full px-4 py-2 rounded border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Optional. Link to site documentation.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition"
              >
                {loading ? "Creating..." : "Create Site"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className={`flex-1 ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } font-medium py-2 px-4 rounded transition`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
