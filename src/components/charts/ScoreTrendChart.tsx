/**
 * @fileoverview ScoreTrendChart Component
 * Displays accessibility score trends over time with improvement metrics.
 *
 * @module components/charts/ScoreTrendChart
 */

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Props for the ScoreTrendChart component
 * @typedef {Object} ScoreTrendChartProps
 * @property {Array} data - Array of score data points
 * @property {string} data[].date - Date of the measurement
 * @property {number} data[].score - Accessibility score
 * @property {string} label - Chart label
 * @property {'blue'|'green'} color - Color scheme for the chart
 */
interface ScoreTrendChartProps {
  data: Array<{
    date: string;
    score: number;
  }>;
  label: string;
  color: "blue" | "green";
}

/**
 * ScoreTrendChart Component
 *
 * Displays an area chart showing accessibility score trends over time. Features:
 * - Configurable color scheme (blue or green)
 * - Calculates and displays improvement metrics
 * - Shows percentage improvement from first to last score
 * - Responsive design
 * - Dark mode support
 * - Interactive tooltip on hover
 *
 * @component
 * @param {ScoreTrendChartProps} props - Component props
 * @param {Array} props.data - Array of score data points with date and score
 * @param {string} props.label - Label for the chart
 * @param {'blue'|'green'} props.color - Color scheme (blue or green)
 * @returns {React.ReactElement} The score trend chart component
 *
 * @example
 * const data = [
 *   { date: '2025-01-01', score: 85 },
 *   { date: '2025-01-02', score: 87 }
 * ];
 * <ScoreTrendChart data={data} label="Axe Score" color="blue" />
 */
export function ScoreTrendChart({ data, label, color }: ScoreTrendChartProps) {
  const { isDark } = useTheme();

  const colorMap = {
    blue: {
      line: isDark ? "#60a5fa" : "#3b82f6",
      fill: isDark ? "#1e40af" : "#dbeafe",
      text: isDark ? "#9ca3af" : "#6b7280",
      grid: isDark ? "#374151" : "#e5e7eb",
    },
    green: {
      line: isDark ? "#34d399" : "#10b981",
      fill: isDark ? "#065f46" : "#dcfce7",
      text: isDark ? "#9ca3af" : "#6b7280",
      grid: isDark ? "#374151" : "#e5e7eb",
    },
  };

  const colors = colorMap[color];

  // Calculate improvement
  const firstScore = data.length > 0 ? data[0].score : 0;
  const lastScore = data.length > 0 ? data[data.length - 1].score : 0;
  const improvement = lastScore - firstScore;
  const improvementPercent =
    firstScore > 0 ? ((improvement / firstScore) * 100).toFixed(1) : "0";

  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {label}
        </h4>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {lastScore}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            / 100
          </span>
          {improvement !== 0 && (
            <span
              className={`text-sm font-semibold ${
                improvement > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {improvement > 0 ? "+" : ""}
              {improvement} ({improvementPercent}%)
            </span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <RechartsAreaChart data={data}>
          <defs>
            <linearGradient
              id={`gradient-${color}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={colors.line} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.line} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            formatter={(value: number) => [`${value}/100`, "Score"]}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke={colors.line}
            fill={`url(#gradient-${color})`}
            strokeWidth={2}
            dot={{ r: 4, fill: colors.line }}
            activeDot={{ r: 6 }}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
