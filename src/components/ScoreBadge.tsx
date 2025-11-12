/**
 * @fileoverview ScoreBadge Component
 * Displays an accessibility score badge with color coding based on score value.
 *
 * @module components/ScoreBadge
 */

/**
 * Props for the ScoreBadge component
 * @typedef {Object} ScoreBadgeProps
 * @property {number} score - The accessibility score (0-100)
 * @property {'sm'|'md'|'lg'} [size='md'] - Size of the badge
 */
interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

/**
 * ScoreBadge Component
 *
 * Displays an accessibility score in a colored badge with the following color scheme:
 * - Green (95+): Excellent accessibility
 * - Yellow (85-94): Good accessibility
 * - Red (<85): Needs improvement
 *
 * @component
 * @param {ScoreBadgeProps} props - Component props
 * @param {number} props.score - The accessibility score (0-100)
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size of the badge (small, medium, large)
 * @returns {React.ReactElement} The rendered score badge
 *
 * @example
 * // Display a medium-sized score badge
 * <ScoreBadge score={92} />
 *
 * @example
 * // Display a large score badge
 * <ScoreBadge score={78} size="lg" />
 */
export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  /**
   * Gets the color classes based on the score
   * @function getColor
   * @param {number} score - The accessibility score
   * @returns {string} Tailwind CSS color classes
   */
  const getColor = (score: number) => {
    if (score >= 95)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score >= 85)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${getColor(
        score
      )} ${sizeClasses[size]}`}
    >
      {score}/100
    </span>
  );
}
