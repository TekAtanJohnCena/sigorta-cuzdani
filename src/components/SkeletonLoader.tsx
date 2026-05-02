/**
 * Skeleton Loader Components
 * Reusable skeleton loaders for better loading UX
 */

export function PolicySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid-stats animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="stats-card">
          <div className="h-10 w-10 bg-gray-200 rounded-full mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      ))}
    </div>
  );
}
