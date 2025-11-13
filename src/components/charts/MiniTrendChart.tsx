/**
 * @fileoverview MiniTrendChart Component
 * Compact line chart showing accessibility score trends over time.
 * Designed for dashboard cards to show historical trends at a glance.
 *
 * @module components/charts/MiniTrendChart
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

interface MiniTrendChartProps {
  data: Array<{
    date: string;
    axe: number;
    lighthouse: number;
  }>;
}

/**
 * MiniTrendChart Component
 *
 * Displays a compact line chart showing both Axe and Lighthouse scores
 * over time. Perfect for dashboard cards to show accessibility trends.
 *
 * Features:
 * - Dual line chart (Axe and Lighthouse)
 * - Compact size for card display
 * - Dark mode support
 * - Responsive design
 * - Hover tooltips
 *
 * @component
 * @param {MiniTrendChartProps} props - Component props
 * @param {Array} props.data - Array of score data with date, axe, and lighthouse
 * @returns {React.ReactElement} The mini trend chart
 */
export function MiniTrendChart({ data }: MiniTrendChartProps) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
        No historical data
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
        Insufficient data - run more scans to see trends
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDark ? "#374151" : "#e5e7eb"}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10 }}
          stroke={isDark ? "#9ca3af" : "#6b7280"}
          style={{ overflow: "visible" }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10 }}
          stroke={isDark ? "#9ca3af" : "#6b7280"}
          width={30}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
            borderRadius: "6px",
            fontSize: "12px",
          }}
          labelStyle={{ color: isDark ? "#f3f4f6" : "#111827" }}
          formatter={(value: number) => value.toFixed(0)}
        />
        <Line
          type="monotone"
          dataKey="axe"
          stroke={isDark ? "#60a5fa" : "#2563eb"}
          dot={{ r: 3, fill: isDark ? "#60a5fa" : "#2563eb" }}
          strokeWidth={3}
          isAnimationActive={false}
          name="Axe"
        />
        <Line
          type="monotone"
          dataKey="lighthouse"
          stroke={isDark ? "#34d399" : "#059669"}
          dot={{ r: 3, fill: isDark ? "#34d399" : "#059669" }}
          strokeWidth={3}
          isAnimationActive={false}
          name="Lighthouse"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
