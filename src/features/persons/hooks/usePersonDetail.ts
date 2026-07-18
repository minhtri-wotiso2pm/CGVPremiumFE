import { useQuery } from "@tanstack/react-query";
import { getPersonByIdApi } from "@/services/api/person.service";
import { PERSON_DETAIL_QUERY_KEY } from "../constants/person.constants";

export function usePersonDetail(id: number | null) {
    return useQuery({
        queryKey: [PERSON_DETAIL_QUERY_KEY, id],
        queryFn: () => getPersonByIdApi(id as number),
        enabled: id != null,
    });
}
