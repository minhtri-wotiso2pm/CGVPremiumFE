import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPersonsApi } from "@/services/api/person.service";
import type { GetPersonsParams } from "../types/person.types";
import { PERSON_LIST_QUERY_KEY } from "../constants/person.constants";

/** Paginated + searchable person list for the admin management table. */
export function usePersonList(params: GetPersonsParams) {
    return useQuery({
        queryKey: [PERSON_LIST_QUERY_KEY, params.search ?? "", params.page ?? 1, params.pageSize ?? 10],
        queryFn: () => getPersonsApi(params),
        placeholderData: keepPreviousData,
    });
}
