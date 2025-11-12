/**
 * @fileoverview Tooltip Component
 * Displays a tooltip on hover with configurable position and styling.
 *
 * @module components/Tooltip
 */

import { ReactNode, useState } from "react";

/**
 * Props for the Tooltip component
 * @typedef {Object} TooltipProps
 * @property {string} content - The tooltip text content
 * @property {ReactNode} children - The element that triggers the tooltip
 * @property {'top'|'bottom'|'left'|'right'} [position='bottom'] - Position of the tooltip relative to children
 */
interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

/**
 * Tooltip Component
 *
 * Displays a tooltip that appears on hover or focus. Features:
 * - Configurable position (top, bottom, left, right)
 * - Arrow pointer indicating the trigger element
 * - Dark mode support
 * - Keyboard accessible (focus/blur events)
 * - Smooth animations
 *
 * @component
 * @param {TooltipProps} props - Component props
 * @param {string} props.content - The tooltip text to display
 * @param {ReactNode} props.children - The element that triggers the tooltip
 * @param {'top'|'bottom'|'left'|'right'} [props.position='bottom'] - Tooltip position
 * @returns {React.ReactElement} The tooltip wrapper
 *
 * @example
 * <Tooltip content="Click to edit">
 *   <button>Edit</button>
 * </Tooltip>
 *
 * @example
 * <Tooltip content="Help text" position="top">
 *   <span>?</span>
 * </Tooltip>
 */
export function Tooltip({
  content,
  children,
  position = "bottom",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 dark:border-t-gray-700",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900 dark:border-b-gray-700",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900 dark:border-l-gray-700",
    right:
      "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900 dark:border-r-gray-700",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
        >
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
            {content}
          </div>
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}
