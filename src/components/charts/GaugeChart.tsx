/**
 * @fileoverview GaugeChart Component
 * Displays an accessibility score as a semi-circular gauge chart with color coding.
 *
 * @module components/charts/GaugeChart
 */

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Props for the GaugeChart component
 * @typedef {Object} GaugeChartProps
 * @property {number} score - The accessibility score (0-100)
 * @property {string} label - Label to display below the gauge
 */
interface GaugeChartProps {
  score: number;
  label: string;
}

/**
 * GaugeChart Component
 *
 * Displays an accessibility score as a semi-circular gauge chart. Features:
 * - Color-coded based on score (green: 95+, yellow: 85-94, red: <85)
 * - Responsive design
 * - Dark mode support
 * - Displays score and label below the gauge
 *
 * @component
 * @param {GaugeChartProps} props - Component props
 * @param {number} props.score - The accessibility score (0-100)
 * @param {string} props.label - Label to display below the gauge
 * @returns {React.ReactElement} The gauge chart component
 *
 * @example
 * <GaugeChart score={92} label="Overall Score" />
 */
export function GaugeChart({ score, label }: GaugeChartProps) {
  const { isDark } = useTheme();

  const getColor = (score: number) => {
    if (score >= 95) return isDark ? "#34d399" : "#10b981";
    if (score >= 85) return isDark ? "#fbbf24" : "#f59e0b";
    return isDark ? "#f87171" : "#ef4444";
  };

  const data = [{ value: score }, { value: 100 - score }];

  const color = getColor(score);
  const emptyColor = isDark ? "#374151" : "#e5e7eb";

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill={emptyColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {score}/100
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}
