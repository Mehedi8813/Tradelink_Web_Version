"use client";

/**
 * LoadingSkeleton - Animated placeholder component for loading states.
 * Displays shimmer effect over gray rectangles to indicate content loading.
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.lines - Number of text lines to display (default: 3)
 * @param {boolean} props.avatar - Show circular avatar placeholder
 * @param {boolean} props.card - Show card-style skeleton
 * 
 * Usage:
 * <LoadingSkeleton lines={5} card />
 * <LoadingSkeleton avatar lines={2} />
 */
export default function LoadingSkeleton({ 
  className = "", 
  lines = 3, 
  avatar = false, 
  card = false 
}) {
  const shimmerClass = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded";

  if (card) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-100 p-6 space-y-4 ${className}`}>
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl ${shimmerClass}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-4 w-1/3 ${shimmerClass}`} />
            <div className={`h-3 w-1/2 ${shimmerClass}`} />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i} 
              className={`h-3 ${shimmerClass}`}
              style={{ width: `${85 - i * 15}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {avatar && (
        <div className="flex items-center gap-4 mb-4">
          <div className={`h-10 w-10 rounded-full ${shimmerClass}`} />
          <div className="space-y-2 flex-1">
            <div className={`h-4 w-1/4 ${shimmerClass}`} />
            <div className={`h-3 w-1/3 ${shimmerClass}`} />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`h-3 ${shimmerClass}`}
          style={{ width: `${90 - i * 20}%` }}
        />
      ))}
    </div>
  );
}

/**
 * StatCardSkeleton - Skeleton loader specifically for stat card layout.
 */
export function StatCardSkeleton({ className = "" }) {
  const shimmerClass = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded";

  return (
    <div className={`bg-white p-5 rounded-3xl border border-slate-100 ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`h-3 w-20 ${shimmerClass}`} />
        <div className={`h-8 w-8 rounded-xl ${shimmerClass}`} />
      </div>
      <div className={`h-8 w-24 ${shimmerClass} mb-2`} />
      <div className={`h-2 w-16 ${shimmerClass}`} />
    </div>
  );
}

/**
 * TableSkeleton - Skeleton loader for table rows.
 * @param {number} rows - Number of skeleton rows to display
 * @param {number} cols - Number of columns per row
 */
export function TableSkeleton({ rows = 5, cols = 5, className = "" }) {
  const shimmerClass = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded";

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-slate-100">
        <div className={`h-4 w-32 ${shimmerClass}`} />
      </div>
      <div className="divide-y divide-slate-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div 
                key={j} 
                className={`h-3 ${shimmerClass}`}
                style={{ width: `${100 / cols}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
