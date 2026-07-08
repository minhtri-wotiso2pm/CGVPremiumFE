import { type FC } from "react";
import { Table, Tooltip, Empty, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ShowtimeTypeListItem } from "../types/showtimeType.types";
import { SHOWTIME_TYPE_PAGE_SIZE } from "../constants/showtimeType.constants";
import { formatSlotShort } from "../utils/showtimeType.utils";

const EyeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const EditIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const CloneIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
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
    data: ShowtimeTypeListItem[];
    loading: boolean;
    isError?: boolean;
    onRetry?: () => void;
    page: number;
    total: number;
    onPageChange: (page: number) => void;
    onView: (row: ShowtimeTypeListItem) => void;
    onEdit: (row: ShowtimeTypeListItem) => void;
    onClone: (row: ShowtimeTypeListItem) => void;
    onDelete: (row: ShowtimeTypeListItem) => void;
}

const SlotChips: FC<{ slots: string[] }> = ({ slots }) => {
    const visible = slots.slice(0, 4);
    const rest = slots.length - visible.length;
    return (
        <div className="stt-chips">
            {visible.map((s) => (
                <span className="stt-chip" key={s}>{formatSlotShort(s)}</span>
            ))}
            {rest > 0 && <span className="stt-chip stt-chip--more">+{rest}</span>}
        </div>
    );
};

const ShowtimeTypeTable: FC<Props> = ({
    data, loading, isError, onRetry,
    page, total, onPageChange,
    onView, onEdit, onClone, onDelete,
}) => {
    const columns: ColumnsType<ShowtimeTypeListItem> = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (v: string) => <span className="stt-cell-name">{v}</span>,
        },
        {
            title: "Slots",
            key: "slotsPreview",
            render: (_, r) => <SlotChips slots={r.slots} />,
            responsive: ["md"],
        },
        {
            title: "Total Slots",
            key: "totalSlots",
            width: 110,
            align: "center",
            render: (_, r) => <span className="stt-cell-muted">{r.slots.length}</span>,
        },
        {
            title: "Status",
            key: "status",
            width: 110,
            render: (_, r) => (
                <span className={`dash-badge ${r.isActive ? "dash-badge--active" : "dash-badge--inactive"}`}>
                    {r.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: "",
            key: "actions",
            width: 150,
            align: "right",
            render: (_, r) => (
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <Tooltip title="Quick preview">
                        <button className="dash-icon-btn" aria-label="Quick preview" onClick={() => onView(r)}><EyeIcon /></button>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <button className="dash-icon-btn" aria-label="Edit" onClick={() => onEdit(r)}><EditIcon /></button>
                    </Tooltip>
                    <Tooltip title="Clone">
                        <button className="dash-icon-btn" aria-label="Clone" onClick={() => onClone(r)}><CloneIcon /></button>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <button className="dash-icon-btn" aria-label="Delete" onClick={() => onDelete(r)} style={{ color: "#E8001C" }}><TrashIcon /></button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    if (isError) {
        return (
            <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                    Failed to load showtime types
                </p>
                {onRetry && <Button onClick={onRetry}>Retry</Button>}
            </div>
        );
    }

    if (!loading && data.length === 0) {
        return (
            <div className="dash-card" style={{ padding: "48px 24px" }}>
                <Empty description="No showtime types found" />
            </div>
        );
    }

    return (
        <div className="dash-card stt-table" style={{ overflow: "hidden" }}>
            <Table<ShowtimeTypeListItem>
                dataSource={data}
                columns={columns}
                rowKey="id"
                loading={loading}
                sticky
                pagination={{
                    current: page,
                    pageSize: SHOWTIME_TYPE_PAGE_SIZE,
                    total,
                    showSizeChanger: false,
                    onChange: onPageChange,
                    showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} showtime types`,
                    style: { padding: "12px 16px", marginBottom: 0 },
                }}
                scroll={{ x: 760 }}
                rowHoverable
            />
        </div>
    );
};

export default ShowtimeTypeTable;
