import { useQuery } from "@tanstack/react-query";
import { getCinemasApi } from "@/services/api/manager.service";
import { getMoviesApi } from "@/services/api/movie.service";
import { getRoomsApi } from "@/services/api/room.service";
import type { Voucher } from "@/features/vouchers/types/voucher.types";

export interface VoucherRuleLabelMaps {
    cinemaNameById: Map<string, string>;
    movieTitleById: Map<string, string>;
    roomNameById: Map<string, string>;
}

/**
 * Resolves Cinema/Movie/Room ids referenced in vouchers' `rules` to display
 * names, for the public Promotions page. The rule-type *metadata* endpoint
 * (GET /vouchers/rule-types) is Admin-only, so unlike the admin rule editor
 * this can't discover which dataSource backs which ruleType — it just fetches
 * the known public list endpoints whenever a displayed voucher references
 * that ruleType. A failed fetch never blocks the page: it just leaves those
 * ids unresolved, and the chip falls back to showing the raw id.
 */
export function useVoucherRuleLabels(vouchers: Voucher[]): VoucherRuleLabelMaps {
    const needsCinema = vouchers.some((v) => v.rules.some((r) => r.ruleType === "Cinema"));
    const needsMovie = vouchers.some((v) => v.rules.some((r) => r.ruleType === "Movie"));
    const needsRoom = vouchers.some((v) => v.rules.some((r) => r.ruleType === "Room"));

    const cinemas = useQuery({
        queryKey: ["publicVoucherRuleCinemas"],
        queryFn: getCinemasApi,
        enabled: needsCinema,
        staleTime: 5 * 60_000,
        retry: false,
    });
    const movies = useQuery({
        queryKey: ["publicVoucherRuleMovies"],
        queryFn: getMoviesApi,
        enabled: needsMovie,
        staleTime: 5 * 60_000,
        retry: false,
    });
    const rooms = useQuery({
        queryKey: ["publicVoucherRuleRooms"],
        queryFn: getRoomsApi,
        enabled: needsRoom,
        staleTime: 5 * 60_000,
        retry: false,
    });

    return {
        cinemaNameById: new Map((cinemas.data ?? []).map((c) => [String(c.cinemaId), c.cinemaName])),
        movieTitleById: new Map((movies.data ?? []).map((m) => [String(m.movieId), m.title])),
        roomNameById: new Map((rooms.data ?? []).map((r) => [String(r.roomId), r.name])),
    };
}
