import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGenreApi, updateGenreApi, deleteGenreApi } from "@/services/api/movie-mgmt.service";
import { notify } from "@/utils/notify";
import { GENRE_QUERY_KEY } from "./useGenreList";

export function useCreateGenre() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createGenreApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GENRE_QUERY_KEY });
            notify.success("Thêm thể loại", "Thể loại mới đã được thêm thành công.");
        },
        onError: () => {
            notify.error("Thêm thất bại", "Không thể thêm thể loại. Vui lòng thử lại.");
        },
    });
}

export function useUpdateGenre() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ genreId, genreName }: { genreId: number; genreName: string }) =>
            updateGenreApi(genreId, genreName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GENRE_QUERY_KEY });
            notify.success("Cập nhật thể loại", "Tên thể loại đã được cập nhật.");
        },
        onError: () => {
            notify.error("Cập nhật thất bại", "Không thể cập nhật thể loại. Vui lòng thử lại.");
        },
    });
}

export function useDeleteGenre() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteGenreApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GENRE_QUERY_KEY });
            notify.success("Đã xóa thể loại", "Thể loại đã được xóa.");
        },
        onError: () => {
            notify.error("Xóa thất bại", "Không thể xóa thể loại. Vui lòng thử lại.");
        },
    });
}
