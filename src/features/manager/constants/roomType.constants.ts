export const ROOM_TYPE_QUERY_KEY = ["room-types"] as const;

/** No search/sort param on GET /room-types, and the number of room types
 *  system-wide is small — same client-side filter/sort approach used for
 *  Cinema/Seat/Showtime Type management elsewhere in this app. */
export const ROOM_TYPE_PAGE_SIZE = 20;
