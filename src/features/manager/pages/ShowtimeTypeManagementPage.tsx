import { type FC, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useProfile } from "@/features/customer/hooks/useProfile";
import { useShowtimeTypes } from "../hooks/useShowtimeTypes";
import type { ShowtimeTypeListItem, ShowtimeTypeModalType } from "../types/showtimeType.types";
import { SHOWTIME_TYPE_PAGE_SIZE } from "../constants/showtimeType.constants";
import ShowtimeTypeToolbar from "../components/ShowtimeTypeToolbar";
import ShowtimeTypeTable from "../components/ShowtimeTypeTable";
import ShowtimeTypeModal from "../components/ShowtimeTypeModal";
import DeleteShowtimeTypeModal from "../components/DeleteShowtimeTypeModal";
import QuickPreviewDrawer from "../components/QuickPreviewDrawer";
import GenerateShowtimeWizard from "../components/wizard/GenerateShowtimeWizard";
import "./showtimeType.css";

const ShowtimeTypeManagementPage: FC = () => {
    useProfile();
    const user = useAppSelector((s) => s.auth.user);
    const cinemaId = user?.cinema?.cinemaId ?? null;

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [sort, setSort] = useState("name-asc");
    const [page, setPage] = useState(1);

    const [modalType, setModalType] = useState<ShowtimeTypeModalType | null>(null);
    const [selected, setSelected] = useState<ShowtimeTypeListItem | null>(null);
    const [previewId, setPreviewId] = useState<number | null>(null);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [wizardTypeId, setWizardTypeId] = useState<number | null>(null);

    const { data, isLoading, isError, refetch } = useShowtimeTypes(cinemaId);

    const filtered = useMemo(() => {
        let result = data?.items ?? [];
        const q = search.trim().toLowerCase();
        if (q) result = result.filter((t) => t.name.toLowerCase().includes(q));
        if (status !== "all") result = result.filter((t) => (status === "active" ? t.isActive : !t.isActive));

        const sorted = [...result];
        switch (sort) {
            case "name-desc": sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
            case "slots-desc": sorted.sort((a, b) => b.slots.length - a.slots.length); break;
            case "slots-asc": sorted.sort((a, b) => a.slots.length - b.slots.length); break;
            default: sorted.sort((a, b) => a.name.localeCompare(b.name));
        }
        return sorted;
    }, [data, search, status, sort]);

    const paged = useMemo(
        () => filtered.slice((page - 1) * SHOWTIME_TYPE_PAGE_SIZE, page * SHOWTIME_TYPE_PAGE_SIZE),
        [filtered, page],
    );

    const openModal = (type: ShowtimeTypeModalType, row?: ShowtimeTypeListItem) => {
        setSelected(row ?? null);
        setModalType(type);
    };
    const closeModal = () => {
        setModalType(null);
        setSelected(null);
    };

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <h1 className="dash-page-title">Showtime Type Management</h1>
                <p className="dash-page-sub">
                    Define reusable daily slot schedules{user?.cinema ? ` for ${user.cinema.cinemaName}` : ""}, used to generate showtimes in bulk.
                </p>
            </div>

            {!cinemaId && !isLoading ? (
                <div className="dash-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--dash-text-2)" }}>
                        Your account is not assigned to a cinema yet. Please contact an administrator.
                    </p>
                </div>
            ) : (
                <>
                    <ShowtimeTypeToolbar
                        search={search}
                        onSearchChange={(v) => { setSearch(v); setPage(1); }}
                        status={status}
                        onStatusChange={(v) => { setStatus(v); setPage(1); }}
                        sort={sort}
                        onSortChange={setSort}
                        onAdd={() => openModal("create")}
                    />

                    <ShowtimeTypeTable
                        data={paged}
                        loading={isLoading}
                        isError={isError}
                        onRetry={() => refetch()}
                        page={page}
                        total={filtered.length}
                        onPageChange={setPage}
                        onView={(row) => setPreviewId(row.id)}
                        onEdit={(row) => openModal("edit", row)}
                        onClone={(row) => openModal("clone", row)}
                        onDelete={(row) => openModal("delete", row)}
                    />
                </>
            )}

            {cinemaId && (
                <>
                    <ShowtimeTypeModal
                        mode={modalType === "edit" || modalType === "clone" ? modalType : "create"}
                        showtimeType={selected}
                        cinemaId={cinemaId}
                        open={modalType === "create" || modalType === "edit" || modalType === "clone"}
                        onClose={closeModal}
                    />
                    <DeleteShowtimeTypeModal
                        showtimeType={selected}
                        open={modalType === "delete"}
                        onClose={closeModal}
                    />
                </>
            )}

            <QuickPreviewDrawer
                showtimeTypeId={previewId}
                onClose={() => setPreviewId(null)}
                onGenerateFromType={(id) => {
                    setPreviewId(null);
                    setWizardTypeId(id);
                    setWizardOpen(true);
                }}
            />

            {cinemaId && (
                <GenerateShowtimeWizard
                    open={wizardOpen}
                    onClose={() => setWizardOpen(false)}
                    cinemaId={cinemaId}
                    initialShowtimeTypeId={wizardTypeId}
                />
            )}
        </div>
    );
};

export default ShowtimeTypeManagementPage;
