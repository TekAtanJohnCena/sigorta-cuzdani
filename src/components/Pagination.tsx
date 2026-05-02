/**
 * Pagination Component
 * Accessible pagination UI with keyboard navigation
 */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show (max 7 pages visible)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-4)",
        borderTop: "1px solid var(--border-light)",
        flexWrap: "wrap",
        gap: "var(--space-4)"
      }}
    >
      {/* Item count */}
      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
        {startItem}-{endItem} / {totalItems} kayıt gösteriliyor
      </div>

      {/* Page controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onPrevious}
          disabled={!hasPrevious}
          aria-label="Önceki sayfa"
          style={{ minWidth: 80 }}
        >
          ← Önceki
        </button>

        <div style={{ display: "flex", gap: "4px" }}>
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    color: "var(--text-tertiary)"
                  }}
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => onPageChange(page as number)}
                aria-label={`Sayfa ${page}`}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  minWidth: 40,
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Sonraki sayfa"
          style={{ minWidth: 80 }}
        >
          Sonraki →
        </button>
      </div>
    </div>
  );
}
