import { type FC } from "react";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import PersonAvatar from "./PersonAvatar";
import type { PersonListItem, PersonModalType } from "../types/person.types";

const EditIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
    </svg>
);

interface Props {
    data: PersonListItem[];
    total: number;
    page: number;
    pageSize: number;
    loading: boolean;
    onPageChange: (page: number, pageSize: number) => void;
    onAction: (person: PersonListItem, type: PersonModalType) => void;
}

const PersonTable: FC<Props> = ({ data, total, page, pageSize, loading, onPageChange, onAction }) => {
    const columns: ColumnsType<PersonListItem> = [
        {
            title: "#",
            key: "index",
            width: 52,
            render: (_, __, i) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", fontVariantNumeric: "tabular-nums" }}>
                    {(page - 1) * pageSize + i + 1}
                </span>
            ),
        },
        {
            title: "Name",
            key: "name",
            render: (_, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <PersonAvatar name={record.name} photoUrl={record.photoUrl} />
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>{record.name}</span>
                </div>
            ),
        },
        {
            title: "Nationality",
            dataIndex: "nationality",
            key: "nationality",
            width: 200,
            render: (n?: string | null) => (
                <span style={{ fontSize: 13, color: n ? "var(--dash-text-2)" : "var(--dash-text-3)" }}>
                    {n || "—"}
                </span>
            ),
        },
        {
            title: "",
            key: "actions",
            width: 96,
            align: "right",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <Tooltip title="Edit">
                        <button className="dash-icon-btn" aria-label="Edit person" onClick={() => onAction(record, "edit")}>
                            <EditIcon />
                        </button>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <button className="dash-icon-btn" aria-label="Delete person" onClick={() => onAction(record, "delete")} style={{ color: "#E8001C" }}>
                            <TrashIcon />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className="dash-card" style={{ overflow: "hidden" }}>
            <Table<PersonListItem>
                dataSource={data}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    onChange: onPageChange,
                    showSizeChanger: false,
                    hideOnSinglePage: true,
                    showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} people`,
                    style: { padding: "12px 16px", marginBottom: 0 },
                }}
                scroll={{ x: 520 }}
                rowHoverable
            />
        </div>
    );
};

export default PersonTable;
