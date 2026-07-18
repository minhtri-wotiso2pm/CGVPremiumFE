import { type FC, useEffect, useState } from "react";
import { Button } from "antd";
import { usePersonList } from "../hooks/usePersonList";
import { PERSON_PAGE_SIZE } from "../constants/person.constants";
import type { PersonListItem, PersonModalType } from "../types/person.types";
import PersonToolbar from "../components/PersonToolbar";
import PersonTable from "../components/PersonTable";
import PersonFormModal from "../components/PersonFormModal";
import DeletePersonModal from "../components/DeletePersonModal";

const UsersIcon = () => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const AlertIcon = () => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const StatPill: FC<{ label: string; value: number }> = ({ label, value }) => (
    <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20,
        background: "rgba(0,0,0,0.03)", border: "1px solid var(--dash-border)",
    }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--dash-text-3)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text-1)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
        <span style={{ fontSize: 12, color: "var(--dash-text-2)" }}>{label}</span>
    </div>
);

const PersonManagementPage: FC = () => {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [modalType, setModalType] = useState<PersonModalType | null>(null);
    const [selected, setSelected] = useState<PersonListItem | null>(null);

    /* Debounce the search box → server query. */
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    const { data, isLoading, isError, refetch, isFetching } = usePersonList({
        search, page, pageSize: PERSON_PAGE_SIZE,
    });

    const people = data?.items ?? [];
    const total = data?.total ?? 0;

    const openModal = (type: PersonModalType, person?: PersonListItem) => {
        setSelected(person ?? null);
        setModalType(type);
    };
    const closeModal = () => {
        setModalType(null);
        setSelected(null);
    };

    const isEmpty = !isLoading && !isError && total === 0 && search === "";

    return (
        <div className="dash-fade-in">
            {/* Header */}
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 className="dash-page-title">Cast &amp; Crew</h1>
                        <p className="dash-page-sub">Manage directors and actors used across the movie catalog.</p>
                    </div>
                    {!isLoading && !isError && total > 0 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <StatPill label="Total People" value={total} />
                        </div>
                    )}
                </div>
            </div>

            {isError ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "64px 24px", textAlign: "center" }}>
                    <div style={{ color: "var(--dash-text-3)" }}><AlertIcon /></div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>Failed to load people</p>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>An error occurred while loading data. Please try again.</p>
                    <Button onClick={() => refetch()} style={{ marginTop: 4 }}>Retry</Button>
                </div>
            ) : isEmpty ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "72px 24px", textAlign: "center" }}>
                    <div style={{ color: "var(--dash-text-3)", opacity: 0.5 }}><UsersIcon /></div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>No People Yet</p>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>Add the first director or actor to the system.</p>
                    <Button type="primary" icon={<PlusIcon />} onClick={() => openModal("create")} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        Add Person
                    </Button>
                </div>
            ) : (
                <>
                    <PersonToolbar
                        search={searchInput}
                        isRefreshing={isFetching}
                        onSearchChange={setSearchInput}
                        onRefresh={() => refetch()}
                        onAdd={() => openModal("create")}
                    />
                    {total === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "52px 24px", textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>No Results Found</p>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>Try a different name.</p>
                            <Button size="small" onClick={() => setSearchInput("")}>Clear Search</Button>
                        </div>
                    ) : (
                        <PersonTable
                            data={people}
                            total={total}
                            page={page}
                            pageSize={PERSON_PAGE_SIZE}
                            loading={isLoading}
                            onPageChange={(p) => setPage(p)}
                            onAction={(person, type) => openModal(type, person)}
                        />
                    )}
                </>
            )}

            {/* Modals */}
            <PersonFormModal
                mode={modalType === "edit" ? "edit" : "create"}
                personId={selected?.id ?? null}
                open={modalType === "create" || modalType === "edit"}
                onClose={closeModal}
            />
            <DeletePersonModal
                person={selected}
                open={modalType === "delete"}
                onClose={closeModal}
            />
        </div>
    );
};

export default PersonManagementPage;
