import type { FC } from "react";
import "./movies.css";

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const MoviePagination: FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    /** Build visible page numbers with ellipsis */
    const getPages = (): (number | "…")[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | "…")[] = [1];
        if (currentPage > 3) pages.push("…");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("…");
        pages.push(totalPages);
        return pages;
    };

    return (
        <nav className="cgv-pagination" aria-label="Movie list pagination">
            {/* Previous */}
            <button
                className="cgv-pagination__btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            {/* Page numbers */}
            {getPages().map((p, i) =>
                p === "…" ? (
                    <span key={`ell-${i}`} className="cgv-pagination__ellipsis">…</span>
                ) : (
                    <button
                        key={p}
                        className={`cgv-pagination__btn${currentPage === p ? " cgv-pagination__btn--active" : ""}`}
                        onClick={() => onPageChange(p as number)}
                        aria-label={`Page ${p}`}
                        aria-current={currentPage === p ? "page" : undefined}
                    >
                        {p}
                    </button>
                )
            )}

            {/* Next */}
            <button
                className="cgv-pagination__btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                >
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
        </nav>
    );
};

export default MoviePagination;