import axiosInstance from "@/services/axios/axiosInstance";
import type {
    GetPersonsParams,
    PersonListResponse,
    PersonListItem,
    PersonDetail,
    CreatePersonPayload,
    UpdatePersonPayload,
    PersonPhotoUploadResult,
    PersonRef,
    PersonFilmographyItem,
    PersonMoviesResponse,
} from "@/features/persons/types/person.types";

/* ── Normalizers (defensive against id/personId naming) ── */
const normalizeListItem = (p: Record<string, unknown>): PersonListItem => ({
    id: Number(p.id ?? p.personId ?? 0),
    name: String(p.name ?? ""),
    photoUrl: (p.photoUrl ?? null) as string | null,
    nationality: (p.nationality ?? null) as string | null,
});

/**
 * Accepts either an array of person objects (`{ id, name, photoUrl }`) or an
 * array of raw ids (`[1, 2]`), returning a consistent `PersonRef[]`. Used to
 * normalize whatever the movie detail endpoint reports for directors/actors.
 */
export const normalizePersonRefs = (raw: unknown): PersonRef[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((entry): PersonRef => {
        if (entry != null && typeof entry === "object") {
            const o = entry as Record<string, unknown>;
            const id = Number(o.id ?? o.personId ?? 0);
            return {
                id,
                name: String(o.name ?? `#${id}`),
                photoUrl: (o.photoUrl ?? null) as string | null,
                nationality: (o.nationality ?? null) as string | null,
            };
        }
        const id = Number(entry);
        return { id, name: `#${id}`, photoUrl: null, nationality: null };
    }).filter((p) => p.id > 0);
};

/* ── GET /api/persons (Anonymous) ── */
export const getPersonsApi = async (params: GetPersonsParams): Promise<PersonListResponse> => {
    const { data } = await axiosInstance.get("/persons", {
        params: {
            search: params.search ?? "",
            page: params.page ?? 1,
            pageSize: params.pageSize ?? 20,
        },
    });

    // Preferred shape: { items, page, pageSize, total }. Fall back to a plain array.
    if (Array.isArray(data)) {
        const items = data.map(normalizeListItem);
        return { items, page: 1, pageSize: items.length, total: items.length };
    }
    return {
        items: Array.isArray(data?.items) ? data.items.map(normalizeListItem) : [],
        page: Number(data?.page ?? 1),
        pageSize: Number(data?.pageSize ?? 20),
        total: Number(data?.total ?? data?.totalItems ?? 0),
    };
};

/* ── GET /api/persons/{id} (Anonymous) ── */
export const getPersonByIdApi = async (id: number): Promise<PersonDetail> => {
    const { data } = await axiosInstance.get(`/persons/${id}`);
    return {
        id: Number(data.id ?? data.personId ?? id),
        name: String(data.name ?? ""),
        biography: (data.biography ?? null) as string | null,
        dateOfBirth: (data.dateOfBirth ?? null) as string | null,
        nationality: (data.nationality ?? null) as string | null,
        gender: (data.gender ?? null) as string | null,
        photoUrl: (data.photoUrl ?? null) as string | null,
        photoPublicId: (data.photoPublicId ?? null) as string | null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
};

/* ── POST /api/persons (Admin) ── */
export const createPersonApi = async (payload: CreatePersonPayload): Promise<PersonDetail> => {
    const { data } = await axiosInstance.post("/persons", payload);
    return {
        id: Number(data.id ?? data.personId ?? 0),
        name: String(data.name ?? payload.name),
        biography: (data.biography ?? payload.biography ?? null) as string | null,
        dateOfBirth: (data.dateOfBirth ?? payload.dateOfBirth ?? null) as string | null,
        nationality: (data.nationality ?? payload.nationality ?? null) as string | null,
        gender: (data.gender ?? payload.gender ?? null) as string | null,
        photoUrl: (data.photoUrl ?? payload.photoUrl ?? null) as string | null,
        photoPublicId: (data.photoPublicId ?? payload.photoPublicId ?? null) as string | null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
};

/* ── PUT /api/persons/{id} (Admin) ── */
export const updatePersonApi = async (id: number, payload: UpdatePersonPayload): Promise<PersonDetail> => {
    const { data } = await axiosInstance.put(`/persons/${id}`, payload);
    return {
        id: Number(data.id ?? id),
        name: String(data.name ?? payload.name),
        biography: (data.biography ?? payload.biography ?? null) as string | null,
        dateOfBirth: (data.dateOfBirth ?? payload.dateOfBirth ?? null) as string | null,
        nationality: (data.nationality ?? payload.nationality ?? null) as string | null,
        gender: (data.gender ?? payload.gender ?? null) as string | null,
        photoUrl: (data.photoUrl ?? payload.photoUrl ?? null) as string | null,
        photoPublicId: (data.photoPublicId ?? payload.photoPublicId ?? null) as string | null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
};

/* ── DELETE /api/persons/{id} (Admin) ──
   On conflict the backend returns { message, movies: string[] } with a non-2xx
   status; the error propagates and is parsed by the delete modal. */
export const deletePersonApi = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/persons/${id}`);
};

/* ── Filmography — GET /api/persons/{id}/movies?page=&pageSize= (Anonymous) ── */
const normalizeFilmographyItem = (m: Record<string, unknown>): PersonFilmographyItem => ({
    movieId: Number(m.movieId ?? 0),
    title: String(m.title ?? ""),
    posterUrl: (m.posterUrl ?? null) as string | null,
    releaseDate: (m.releaseDate ?? null) as string | null,
    duration: Number(m.duration ?? 0),
    ageRating: String(m.ageRating ?? "P"),
    roles: Array.isArray(m.roles) ? (m.roles as unknown[]).map(String) : [],
});

export const getPersonMoviesApi = async (
    personId: number,
    page = 1,
    pageSize = 12,
): Promise<PersonMoviesResponse> => {
    const { data } = await axiosInstance.get(`/persons/${personId}/movies`, {
        params: { page, pageSize },
    });
    return {
        personId: Number(data?.personId ?? personId),
        personName: String(data?.personName ?? ""),
        totalMovies: Number(data?.totalMovies ?? 0),
        page: Number(data?.page ?? page),
        pageSize: Number(data?.pageSize ?? pageSize),
        items: Array.isArray(data?.items) ? data.items.map(normalizeFilmographyItem) : [],
    };
};

/* ── POST /api/uploads/person-photo (Admin, multipart) ── */
export const uploadPersonPhotoApi = async (file: File): Promise<PersonPhotoUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axiosInstance.post("/uploads/person-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return { url: String(data.url ?? ""), publicId: String(data.publicId ?? "") };
};
