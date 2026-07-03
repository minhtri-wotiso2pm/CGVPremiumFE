import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createMovieApi,
    updateMovieApi,
    deleteMovieApi,
    uploadMoviePosterApi,
} from "@/services/api/movie-mgmt.service";
import { notify } from "@/utils/notify";
import { MOVIE_LIST_QUERY_KEY } from "./useMovieList";

export function useCreateMovie() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createMovieApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MOVIE_LIST_QUERY_KEY });
            notify.success("Tạo phim thành công", "Phim mới đã được thêm vào danh sách.");
        },
        onError: () => {
            notify.error("Tạo phim thất bại", "Vui lòng kiểm tra lại thông tin và thử lại.");
        },
    });
}

export function useUpdateMovie() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ movieId, payload }: { movieId: number; payload: Parameters<typeof updateMovieApi>[1] }) =>
            updateMovieApi(movieId, payload),
        onSuccess: (_, { movieId }) => {
            queryClient.invalidateQueries({ queryKey: MOVIE_LIST_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["manager-movie-detail", movieId] });
            notify.success("Cập nhật thành công", "Thông tin phim đã được lưu.");
        },
        onError: () => {
            notify.error("Cập nhật thất bại", "Vui lòng kiểm tra lại thông tin và thử lại.");
        },
    });
}

export function useDeleteMovie() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMovieApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MOVIE_LIST_QUERY_KEY });
            notify.success("Đã xóa phim", "Phim đã được xóa khỏi danh sách.");
        },
        onError: () => {
            notify.error("Xóa thất bại", "Không thể xóa phim. Vui lòng thử lại.");
        },
    });
}

export function useUploadMoviePoster() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ movieId, file }: { movieId: number; file: File }) =>
            uploadMoviePosterApi(movieId, file),
        onSuccess: (_, { movieId }) => {
            queryClient.invalidateQueries({ queryKey: MOVIE_LIST_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["manager-movie-detail", movieId] });
        },
        onError: () => {
            notify.warning("Tải poster thất bại", "Phim đã được lưu nhưng không thể upload poster.");
        },
    });
}
