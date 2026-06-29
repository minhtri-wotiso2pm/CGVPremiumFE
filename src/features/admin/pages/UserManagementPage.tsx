import { useState, useCallback, type FC } from "react";
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
import DeleteUserModal from "../components/DeleteUserModal";

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
    const handleRoleChange   = (v: string) => { setRole(v);   setPage(1); };
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
                <div>
                    <h1 className="dash-page-title">User Management</h1>
                    <p className="dash-page-sub">
                        {data?.totalItems !== undefined ? `${data.totalItems} total users` : "Loading…"}
                    </p>
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
            <DeleteUserModal
                user={selectedUser}
                open={modal === "delete"}
                {...modalProps}
            />
        </div>
    );
};

export default UserManagementPage;
