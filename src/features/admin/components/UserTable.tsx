import { type FC } from "react";
import { Table, type TableProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { AdminUser, UserModalType } from "../types/user.types";
import type { GetUsersParams } from "../types/user.types";
import UserActionMenu from "./UserActionMenu";

const roleClass: Record<string, string> = {
    admin:    "dash-role--admin",
    manager:  "dash-role--manager",
    staff:    "dash-role--staff",
    customer: "dash-role--customer",
};
const statusClass: Record<string, string> = {
    active:     "dash-badge--active",
    inactive:   "dash-badge--inactive",
    banned:     "dash-badge--banned",
    unverified: "dash-badge--pending",
};

const AvatarCell = ({ user }: { user: AdminUser }) => {
    const initials = user.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="dash-avatar" />
            ) : (
                <div className="dash-avatar-fallback" style={{ width: 36, height: 36, fontSize: 12 }}>
                    {initials}
                </div>
            )}
            <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)", lineHeight: 1.3 }}>
                    {user.fullName}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--dash-text-2)", marginTop: 1 }}>
                    {user.email}
                </div>
            </div>
        </div>
    );
};

interface Props {
    data: AdminUser[];
    total: number;
    params: GetUsersParams;
    loading: boolean;
    processingUserId: number | null;
    onParamsChange: (patch: Partial<GetUsersParams>) => void;
    onAction: (user: AdminUser, type: UserModalType) => void;
}

const UserTable: FC<Props> = ({
    data, total, params, loading, processingUserId,
    onParamsChange, onAction,
}) => {
    const columns: ColumnsType<AdminUser> = [
        {
            title: "#",
            key: "index",
            width: 52,
            render: (_, __, i) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", fontVariantNumeric: "tabular-nums" }}>
                    {(params.page - 1) * params.pageSize + i + 1}
                </span>
            ),
        },
        {
            title: "User",
            key: "user",
            render: (_, record) => <AvatarCell user={record} />,
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
            render: (v: string) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{v || "—"}</span>
            ),
            responsive: ["md"],
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role: string) => (
                <span className={`dash-role ${roleClass[role] ?? "dash-role--customer"}`}>{role}</span>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <span className={`dash-badge ${statusClass[status] ?? "dash-badge--inactive"}`}>{status}</span>
            ),
        },
        {
            title: "Joined",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", whiteSpace: "nowrap" }}>
                    {new Date(date).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                    })}
                </span>
            ),
            responsive: ["lg"],
        },
        {
            title: "",
            key: "actions",
            width: 52,
            align: "center",
            render: (_, record) => (
                <UserActionMenu
                    user={record}
                    isProcessing={processingUserId === record.userId}
                    onAction={(type) => onAction(record, type)}
                />
            ),
        },
    ];

    const onChange: TableProps<AdminUser>["onChange"] = (pagination) => {
        onParamsChange({
            page: pagination.current ?? 1,
            pageSize: pagination.pageSize ?? 10,
        });
    };

    return (
        <Table<AdminUser>
            dataSource={data}
            columns={columns}
            rowKey="userId"
            loading={loading}
            onChange={onChange}
            pagination={{
                current: params.page,
                pageSize: params.pageSize,
                total,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} users`,
            }}
            scroll={{ x: 600 }}
        />
    );
};

export default UserTable;
