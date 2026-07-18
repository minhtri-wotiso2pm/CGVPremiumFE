/* ══════════════════════════════════════════
   Person (Cast & Crew) — constants
══════════════════════════════════════════ */

/** React Query keys */
export const PERSON_LIST_QUERY_KEY = "admin-persons";
export const PERSON_DETAIL_QUERY_KEY = "admin-person-detail";
export const PERSON_SEARCH_QUERY_KEY = "person-search";

/** Page size for the Person Management table (server-side pagination). */
export const PERSON_PAGE_SIZE = 10;

/** Page size for autocomplete search inside the Movie form. */
export const PERSON_SEARCH_PAGE_SIZE = 20;

/** Photo upload limits (mirrors backend rule: jpg/jpeg/png/webp, ≤ 10 MB). */
export const PERSON_PHOTO_MAX_MB = 10;
export const PERSON_PHOTO_ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export const GENDER_OPTIONS = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
];
