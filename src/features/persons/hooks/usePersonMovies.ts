import { useQuery } from "@tanstack/react-query";
import { getPersonMoviesApi } from "@/services/api/person.service";

/**
 * A person's filmography. Currently a stub (BE hasn't shipped movies-by-person
 * yet), so it's disabled by default and the profile page renders a placeholder.
 * When the endpoint lands: implement getPersonMoviesApi and pass enabled = true.
 */
export function usePersonMovies(id: number | null, enabled = false) {
    return useQuery({
        queryKey: ["person-movies", id],
        queryFn: () => getPersonMoviesApi(id as number),
        enabled: enabled && id != null,
    });
}
