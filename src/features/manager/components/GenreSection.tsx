import { type FC, useState } from "react";
import { Input, Button, Tooltip, Spin } from "antd";
import { useGenreList } from "../hooks/useGenreList";
import { useCreateGenre, useUpdateGenre, useDeleteGenre } from "../hooks/useGenreMutations";
import type { Genre } from "../types/movie-mgmt.types";

/* ── Icons ── */
const EditIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M9 6V4h6v2" />
    </svg>
);

const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

/* ── Single genre row ── */
const GenreRow: FC<{
    genre: Genre;
    onEdit: (genre: Genre) => void;
    onDelete: (genre: Genre) => void;
    isDeleting: boolean;
    editingId: number | null;
    editingName: string;
    onEditNameChange: (v: string) => void;
    onEditSave: () => void;
    onEditCancel: () => void;
    isSaving: boolean;
}> = ({
    genre, onEdit, onDelete, isDeleting,
    editingId, editingName, onEditNameChange, onEditSave, onEditCancel, isSaving,
}) => {
    const isEditing = editingId === genre.genreId;

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px",
            borderBottom: "1px solid var(--dash-border)",
        }}>
            {isEditing ? (
                <>
                    <Input
                        size="small"
                        value={editingName}
                        onChange={(e) => onEditNameChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onEditSave();
                            if (e.key === "Escape") onEditCancel();
                        }}
                        maxLength={50}
                        autoFocus
                        style={{ flex: 1 }}
                    />
                    <Tooltip title="Lưu">
                        <button
                            className="dash-icon-btn"
                            onClick={onEditSave}
                            disabled={!editingName.trim() || isSaving}
                            style={{ color: "#22c55e" }}
                        >
                            {isSaving ? <Spin size="small" /> : <CheckIcon />}
                        </button>
                    </Tooltip>
                    <Tooltip title="Hủy">
                        <button className="dash-icon-btn" onClick={onEditCancel}>
                            <XIcon />
                        </button>
                    </Tooltip>
                </>
            ) : (
                <>
                    <span style={{
                        flex: 1, fontSize: 13,
                        color: "var(--dash-text-1)", fontWeight: 500,
                    }}>
                        {genre.genreName}
                    </span>
                    <Tooltip title="Sửa tên">
                        <button
                            className="dash-icon-btn"
                            onClick={() => onEdit(genre)}
                            disabled={isDeleting}
                        >
                            <EditIcon />
                        </button>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <button
                            className="dash-icon-btn dash-icon-btn--danger"
                            onClick={() => onDelete(genre)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Spin size="small" /> : <TrashIcon />}
                        </button>
                    </Tooltip>
                </>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════
   GenreSection
══════════════════════════════════════════ */
const GenreSection: FC = () => {
    const { data: genres = [], isLoading } = useGenreList();
    const { mutate: create, isPending: creating } = useCreateGenre();
    const { mutate: update, isPending: updating } = useUpdateGenre();
    const { mutate: del, isPending: deleting, variables: deletingId } = useDeleteGenre();

    const [newName, setNewName]       = useState("");
    const [editingId, setEditingId]   = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    const handleCreate = () => {
        const name = newName.trim();
        if (!name) return;
        create(name, { onSuccess: () => setNewName("") });
    };

    const handleEditStart = (genre: Genre) => {
        setEditingId(genre.genreId);
        setEditingName(genre.genreName);
    };

    const handleEditSave = () => {
        if (!editingId || !editingName.trim()) return;
        update(
            { genreId: editingId, genreName: editingName.trim() },
            { onSuccess: () => { setEditingId(null); setEditingName(""); } },
        );
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditingName("");
    };

    const handleDelete = (genre: Genre) => {
        del(genre.genreId);
    };

    return (
        <div style={{ maxWidth: 560 }}>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                Danh sách thể loại
            </p>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--dash-text-2)" }}>
                Thể loại dùng khi gán cho phim. Thêm hoặc chỉnh sửa tên thể loại tại đây.
            </p>

            {/* Add new genre */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <Input
                    placeholder="Tên thể loại mới..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                    maxLength={50}
                    style={{ flex: 1 }}
                    disabled={creating}
                />
                <Button
                    type="primary"
                    onClick={handleCreate}
                    loading={creating}
                    disabled={!newName.trim()}
                >
                    Thêm
                </Button>
            </div>

            {/* Genre list */}
            <div className="dash-card" style={{ overflow: "hidden" }}>
                {isLoading ? (
                    <div style={{ padding: "32px 0", textAlign: "center" }}>
                        <Spin />
                    </div>
                ) : genres.length === 0 ? (
                    <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--dash-text-3)", fontSize: 13 }}>
                        Chưa có thể loại nào. Thêm thể loại đầu tiên ở trên.
                    </div>
                ) : (
                    genres.map((genre) => (
                        <GenreRow
                            key={genre.genreId}
                            genre={genre}
                            onEdit={handleEditStart}
                            onDelete={handleDelete}
                            isDeleting={deleting && deletingId === genre.genreId}
                            editingId={editingId}
                            editingName={editingName}
                            onEditNameChange={setEditingName}
                            onEditSave={handleEditSave}
                            onEditCancel={handleEditCancel}
                            isSaving={updating}
                        />
                    ))
                )}
            </div>

            <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--dash-text-3)" }}>
                {genres.length > 0 && `${genres.length} thể loại`}
            </p>
        </div>
    );
};

export default GenreSection;
