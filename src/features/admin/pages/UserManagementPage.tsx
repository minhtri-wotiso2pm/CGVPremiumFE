import { useState, useCallback, useMemo, type FC } from "react";
import { useUsers } from "../hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { ADMIN_PAGE_SIZE } from "../constants/admin.constants";
import type { AdminUser, UserModalType, GetUsersParams } from "../types/user.types";
import UserToolbar from "../components/UserToolbar";
import UserTable from "../components/UserTable";
import CreateUserModal from "../components/CreateUserModal";
import UpdateUserModal from "../components/UpdateUserModal";
import ChangeRoleModal from "../components/ChangeRoleModal";
import ChangeStatusModal from "../components/ChangeStatusModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
// import DeleteUserModal from "../components/DeleteUserModal";

/* ── Stat pill (mirrors CinemaManagementPage) ── */
const StatPill: FC<{ label: string; value: number; accent?: boolean; muted?: boolean }> = ({
    label, value, accent, muted,
}) => (
    <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 14px", borderRadius: 20,
        background: accent ? "rgba(232,0,28,0.06)" : muted ? "rgba(0,0,0,0.03)" : "rgba(34,197,94,0.06)",
        border: `1px solid ${accent ? "rgba(232,0,28,0.14)" : muted ? "var(--dash-border)" : "rgba(34,197,94,0.18)"}`,
    }}>
        <span style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: accent ? "#E8001C" : muted ? "var(--dash-text-3)" : "#22c55e",
        }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text-1)", fontVariantNumeric: "tabular-nums" }}>
            {value}
        </span>
        <span style={{ fontSize: 12, color: "var(--dash-text-2)" }}>{label}</span>
    </div>
);

const UserManagementPage: FC = () => {
    /* ── Filters ── */
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const debouncedSearch = useDebounce(search, 350);

    /* ── Pagination ── */
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(ADMIN_PAGE_SIZE);

    const params: GetUsersParams = {
        search: debouncedSearch || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        pageSize,
    };

    /* ── Data ── */
    const { data, isLoading, isFetching } = useUsers(params);

    // Dedicated unfiltered/unpaginated fetch so the summary pills reflect
    // all users, not just whatever fits on the current filtered table page.
    const { data: statsData } = useUsers({ page: 1, pageSize: 1000 });
    const stats = useMemo(() => {
        const all = statsData?.items ?? [];
        return {
            total: statsData?.totalItems ?? all.length,
            active: all.filter((u) => u.status === "active").length,
            banned: all.filter((u) => u.status === "banned").length,
        };
    }, [statsData]);

    /* ── Active modal + selected user ── */
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [modal, setModal] = useState<UserModalType | null>(null);
    const [processingUserId, setProcessingUserId] = useState<number | null>(null);

    const openModal = useCallback((user: AdminUser, type: UserModalType) => {
        setSelectedUser(user);
        setModal(type);
    }, []);

    const closeModal = useCallback(() => {
        setModal(null);
        setSelectedUser(null);
    }, []);

    const handleMutationStart = useCallback(() => {
        if (selectedUser) setProcessingUserId(selectedUser.userId);
    }, [selectedUser]);

    const handleMutationEnd = useCallback(() => {
        setProcessingUserId(null);
    }, []);

    const handleParamsChange = useCallback((patch: Partial<GetUsersParams>) => {
        if (patch.page !== undefined) setPage(patch.page);
        if (patch.pageSize !== undefined) setPageSize(patch.pageSize);
    }, []);

    /* Reset to page 1 on filter change */
    const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
    const handleRoleChange = (v: string) => { setRole(v); setPage(1); };
    const handleStatusChange = (v: string) => { setStatus(v); setPage(1); };

    const modalProps = {
        onClose: closeModal,
        onMutationStart: handleMutationStart,
        onMutationEnd: handleMutationEnd,
    };

    return (
        <div className="dash-fade-in">
            {/* Page header */}
            <div className="dash-page-header">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 className="dash-page-title">User Management</h1>
                        <p className="dash-page-sub">
                            {data?.totalItems !== undefined ? `${data.totalItems} total users` : "Loading…"}
                        </p>
                    </div>
                    {stats.total > 0 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <StatPill label="Total" value={stats.total} muted />
                            <StatPill label="Active" value={stats.active} />
                            {/* <StatPill label="Banned" value={stats.banned} accent /> */}
                        </div>
                    )}
                </div>
            </div>

            {/* Table card */}
            <div className="dash-card">
                <UserToolbar
                    search={search}
                    role={role}
                    status={status}
                    onSearchChange={handleSearchChange}
                    onRoleChange={handleRoleChange}
                    onStatusChange={handleStatusChange}
                    onCreateClick={() => setModal("create")}
                />
                <UserTable
                    data={data?.items ?? []}
                    total={data?.totalItems ?? 0}
                    params={{ page, pageSize, search, role, status }}
                    loading={isLoading || isFetching}
                    processingUserId={processingUserId}
                    onParamsChange={handleParamsChange}
                    onAction={openModal}
                />
            </div>

            {/* Modals */}
            <CreateUserModal
                open={modal === "create"}
                onClose={closeModal}
                onMutationStart={() => setProcessingUserId(-1)}
                onMutationEnd={handleMutationEnd}
            />
            <UpdateUserModal
                user={selectedUser}
                open={modal === "update"}
                {...modalProps}
            />
            <ChangeRoleModal
                user={selectedUser}
                open={modal === "role"}
                {...modalProps}
            />
            <ChangeStatusModal
                user={selectedUser}
                open={modal === "status"}
                {...modalProps}
            />
            <ChangePasswordModal
                user={selectedUser}
                open={modal === "password"}
                {...modalProps}
            />
            {/* <DeleteUserModal
                user={selectedUser}
                open={modal === "delete"}
                {...modalProps}
            /> */}
        </div>
    );
};

export default UserManagementPage;
