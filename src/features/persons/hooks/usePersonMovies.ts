import { useInfiniteQuery } from "@tanstack/react-query";
import { getPersonMoviesApi } from "@/services/api/person.service";

const FILMOGRAPHY_PAGE_SIZE = 12;

/**
 * A person's filmography (GET /api/persons/{id}/movies), paged for "Load more".
 * Flatten `data.pages` into a single list in the component.
 */
export function usePersonMovies(id: number | null, pageSize = FILMOGRAPHY_PAGE_SIZE) {
    return useInfiniteQuery({
        queryKey: ["person-movies", id, pageSize],
        queryFn: ({ pageParam }) => getPersonMoviesApi(id as number, pageParam, pageSize),
        initialPageParam: 1,
        getNextPageParam: (last) =>
            last.page * last.pageSize < last.totalMovies ? last.page + 1 : undefined,
        enabled: id != null,
    });
}
