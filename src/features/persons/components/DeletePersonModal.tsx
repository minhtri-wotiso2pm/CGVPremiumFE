import { type FC, useEffect, useState } from "react";
import { Modal, Button } from "antd";
import { useDeletePerson } from "../hooks/usePersonMutations";
import type { PersonListItem } from "../types/person.types";

interface Props {
    person: PersonListItem | null;
    open: boolean;
    onClose: () => void;
}

/** Extract the blocked-movie list from the backend 409/400 conflict body. */
function extractBlockingMovies(err: unknown): string[] | null {
    const data = (err as { response?: { data?: { movies?: unknown } } })?.response?.data;
    if (data && Array.isArray(data.movies)) return data.movies.map(String);
    return null;
}

const DeletePersonModal: FC<Props> = ({ person, open, onClose }) => {
    const { mutate: del, isPending } = useDeletePerson();
    const [blockedMovies, setBlockedMovies] = useState<string[] | null>(null);

    useEffect(() => {
        if (open) setBlockedMovies(null);
    }, [open]);

    const handleDelete = () => {
        if (!person) return;
        del(person.id, {
            onSuccess: () => onClose(),
            onError: (err) => {
                const movies = extractBlockingMovies(err);
                setBlockedMovies(movies ?? []);
            },
        });
    };

    const isBlocked = blockedMovies !== null;

    return (
        <Modal
            title={isBlocked ? "Cannot Delete Person" : "Delete Person"}
            open={open}
            onCancel={() => !isPending && onClose()}
            maskClosable={!isPending}
            footer={
                isBlocked ? (
                    <Button type="primary" onClick={onClose}>Understood</Button>
                ) : (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <Button onClick={onClose} disabled={isPending}>Cancel</Button>
                        <Button danger type="primary" loading={isPending} onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                )
            }
            width={460}
            destroyOnHidden
        >
            {isBlocked ? (
                <div>
                    <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--dash-text-1)" }}>
                        <strong>{person?.name}</strong> is still assigned to the following movie
                        {blockedMovies!.length === 1 ? "" : "s"} and cannot be deleted:
                    </p>
                    <ul style={{
                        margin: 0, padding: "12px 16px", listStyle: "none",
                        background: "rgba(232,0,28,0.05)", border: "1px solid rgba(232,0,28,0.15)",
                        borderRadius: 8, maxHeight: 200, overflowY: "auto",
                    }}>
                        {blockedMovies!.map((m) => (
                            <li key={m} style={{ padding: "3px 0", fontSize: 13, color: "var(--dash-text-1)" }}>
                                🎬 {m}
                            </li>
                        ))}
                    </ul>
                    <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--dash-text-3)" }}>
                        Remove this person from those movies first, then try again.
                    </p>
                </div>
            ) : (
                <p style={{ margin: 0, fontSize: 14, color: "var(--dash-text-1)" }}>
                    Are you sure you want to delete <strong>{person?.name}</strong>? This action cannot be undone.
                </p>
            )}
        </Modal>
    );
};

export default DeletePersonModal;
