export const SHOWTIME_QUERY_KEY = (movieName: string, date: string) =>
    ["showtimes", movieName, date] as const;

export const SHOWTIME_DEFAULT_PARAMS = {
    page: 1,
    pageSize: 100,
    sortBy: "startTime",
    sortDir: "asc",
} as const;

export const SHOWTIME_DATE_COUNT = 10;

export const ALL_CINEMAS = null;
export const ALL_ROOM_TYPES = "ALL";
