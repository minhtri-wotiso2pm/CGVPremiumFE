import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPersonsApi } from "@/services/api/person.service";
import { PERSON_SEARCH_QUERY_KEY, PERSON_SEARCH_PAGE_SIZE } from "../constants/person.constants";

/** Debounce a fast-changing value (used for the autocomplete search box). */
function useDebounced<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

/**
 * Debounced person search used by <PersonSelect> autocomplete.
 * `enabled` lets callers pause fetching while the dropdown is closed.
 */
export function usePersonSearch(term: string, enabled = true) {
    const debounced = useDebounced(term.trim(), 300);

    const query = useQuery({
        queryKey: [PERSON_SEARCH_QUERY_KEY, debounced],
        queryFn: () => getPersonsApi({ search: debounced, page: 1, pageSize: PERSON_SEARCH_PAGE_SIZE }),
        placeholderData: keepPreviousData,
        enabled,
        staleTime: 60_000,
    });

    return { ...query, debouncedTerm: debounced };
}
