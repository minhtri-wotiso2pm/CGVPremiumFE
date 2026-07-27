import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createPersonApi,
    updatePersonApi,
    deletePersonApi,
    uploadPersonPhotoApi,
} from "@/services/api/person.service";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";
import type { CreatePersonPayload, UpdatePersonPayload } from "../types/person.types";
import { PERSON_LIST_QUERY_KEY, PERSON_DETAIL_QUERY_KEY, PERSON_SEARCH_QUERY_KEY } from "../constants/person.constants";

/** Invalidate every query that could show a stale person list. */
function useInvalidatePersons() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: [PERSON_LIST_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [PERSON_SEARCH_QUERY_KEY] });
    };
}

export function useCreatePerson() {
    const invalidate = useInvalidatePersons();
    return useMutation({
        mutationFn: (payload: CreatePersonPayload) => createPersonApi(payload),
        onSuccess: () => {
            invalidate();
            notify.success("Person Created", "The new person has been added.");
        },
        onError: (err: unknown) => {
            notify.error("Failed to Create Person", getApiErrorMessage(err, "Please check the details and try again."));
        },
    });
}

export function useUpdatePerson() {
    const invalidate = useInvalidatePersons();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdatePersonPayload }) =>
            updatePersonApi(id, payload),
        onSuccess: (_, { id }) => {
            invalidate();
            queryClient.invalidateQueries({ queryKey: [PERSON_DETAIL_QUERY_KEY, id] });
            notify.success("Updated Successfully", "The person's details have been saved.");
        },
        onError: (err: unknown) => {
            notify.error("Update Failed", getApiErrorMessage(err, "Please check the details and try again."));
        },
    });
}

export function useDeletePerson() {
    const invalidate = useInvalidatePersons();
    return useMutation({
        mutationFn: (id: number) => deletePersonApi(id),
        onSuccess: () => {
            invalidate();
            notify.success("Person Deleted", "The person has been removed.");
        },
        // Note: the "assigned to movies" conflict is surfaced by the delete modal,
        // which reads error.response.data.movies — so no generic toast here.
    });
}

export function useUploadPersonPhoto() {
    return useMutation({
        mutationFn: (file: File) => uploadPersonPhotoApi(file),
    });
}
