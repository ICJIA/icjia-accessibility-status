/**
 * @fileoverview LineChart Component
 * Displays accessibility score trends over time for Axe and Lighthouse tools.
 *
 * @module components/charts/LineChart
 */

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Props for the LineChart component
 * @typedef {Object} LineChartProps
 * @property {Array} data - Array of score data points
 * @property {string} data[].date - Date of the measurement
 * @property {number} data[].axe - Axe accessibility score
 * @property {number} data[].lighthouse - Lighthouse accessibility score
 */
interface LineChartProps {
  data: Array<{
    date: string;
    axe: number;
    lighthouse: number;
  }>;
}

/**
 * LineChart Component
 *
 * Displays a line chart showing accessibility score trends over time. Features:
 * - Dual line display for Axe and Lighthouse scores
 * - Color-coded lines (blue for Axe, green for Lighthouse)
 * - Responsive design
 * - Dark mode support
 * - Interactive tooltip on hover
 * - Legend for tool identification
 *
 * @component
 * @param {LineChartProps} props - Component props
 * @param {Array} props.data - Array of score data points with date, axe, and lighthouse values
 * @returns {React.ReactElement} The line chart component
 *
 * @example
 * const data = [
 *   { date: '2025-01-01', axe: 85, lighthouse: 90 },
 *   { date: '2025-01-02', axe: 87, lighthouse: 92 }
 * ];
 * <LineChart data={data} />
 */
export function LineChart({ data }: LineChartProps) {
  const { isDark } = useTheme();

  const colors = {
    axe: isDark ? "#60a5fa" : "#3b82f6",
    lighthouse: isDark ? "#34d399" : "#10b981",
    grid: isDark ? "#374151" : "#e5e7eb",
    text: isDark ? "#9ca3af" : "#6b7280",
  };

  // Show message if insufficient data
  if (!data || data.length < 2) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Insufficient data to display trends
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Run at least 2 scans to see historical trends
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="date"
          stroke={colors.text}
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke={colors.text}
          style={{ fontSize: "12px" }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            border: `1px solid ${colors.grid}`,
            borderRadius: "8px",
            color: isDark ? "#f3f4f6" : "#111827",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="axe"
          stroke={colors.axe}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Axe Score"
        />
        <Line
          type="monotone"
          dataKey="lighthouse"
          stroke={colors.lighthouse}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Lighthouse Score"
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
