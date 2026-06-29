import { useEffect, useMemo, useState } from "react";

export function usePagination<T>(
    items: T[],
    pageSize: number,
    resetDependencies: unknown[] = []
) {
    useEffect(() => {
        setPage(1);
    }, resetDependencies);
    const [page, setPage] = useState(1);

    const totalPages = Math.max(
        1,
        Math.ceil(items.length / pageSize)
    );

    const currentItems = useMemo(() => {

        const start =
            (page - 1) * pageSize;

        return items.slice(
            start,
            start + pageSize
        );

    }, [items, page, pageSize]);

    return {

        page,
        setPage,
        totalPages,
        currentItems

    };

}