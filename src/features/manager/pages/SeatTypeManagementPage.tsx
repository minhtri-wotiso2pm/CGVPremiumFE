import { type FC, useState } from "react";
import { Button, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSeatTypes } from "../hooks/useSeatTypes";
import type { SeatType, SeatTypeModalType } from "../types/room.types";
import { SEAT_TYPE_PAGE_SIZE } from "../constants/room.constants";
import SeatTypeModal from "../components/SeatTypeModal";
import DeleteSeatTypeModal from "../components/DeleteSeatTypeModal";

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
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

const formatVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const SeatTypeManagementPage: FC = () => {
    const { data: seatTypes = [], isLoading, isError, refetch } = useSeatTypes();

    const [modalType, setModalType] = useState<SeatTypeModalType | null>(null);
    const [selected, setSelected] = useState<SeatType | null>(null);

    const openModal = (type: SeatTypeModalType, seatType?: SeatType) => {
        setSelected(seatType ?? null);
        setModalType(type);
    };
    const closeModal = () => {
        setModalType(null);
        setSelected(null);
    };

    const columns: ColumnsType<SeatType> = [
        {
            title: "#",
            key: "index",
            width: 52,
            render: (_, __, i) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
            ),
        },
        {
            title: "Type Name",
            dataIndex: "typeName",
            key: "typeName",
            render: (name: string) => (
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>{name}</span>
            ),
        },
        {
            title: "Capacity",
            dataIndex: "capacity",
            key: "capacity",
            width: 120,
            render: (c: number) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{c} seat{c > 1 ? "s" : ""}</span>
            ),
        },
        {
            title: "Extra Price",
            dataIndex: "extraPrice",
            key: "extraPrice",
            width: 150,
            render: (p: number) => (
                <span style={{ fontSize: 13, color: p > 0 ? "var(--dash-crimson)" : "var(--dash-text-2)", fontWeight: p > 0 ? 600 : 400 }}>
                    {p > 0 ? `+${formatVnd(p)}` : "No extra"}
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
                        <button className="dash-icon-btn" aria-label="Edit seat type" onClick={() => openModal("edit", record)}>
                            <EditIcon />
                        </button>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <button className="dash-icon-btn" aria-label="Delete seat type" onClick={() => openModal("delete", record)} style={{ color: "#E8001C" }}>
                            <TrashIcon />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 className="dash-page-title">Seat Types</h1>
                        <p className="dash-page-sub">Define seat categories and their pricing used across your rooms.</p>
                    </div>
                    <Button type="primary" icon={<PlusIcon />} onClick={() => openModal("create")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        Add Seat Type
                    </Button>
                </div>
            </div>

            {isError ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "64px 24px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>Failed to load seat types</p>
                    <Button onClick={() => refetch()}>Retry</Button>
                </div>
            ) : (
                <div className="dash-card" style={{ overflow: "hidden" }}>
                    <Table<SeatType>
                        dataSource={seatTypes}
                        columns={columns}
                        rowKey="seatTypeId"
                        loading={isLoading}
                        pagination={{
                            pageSize: SEAT_TYPE_PAGE_SIZE,
                            hideOnSinglePage: true,
                            showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} seat types`,
                            style: { padding: "12px 16px", marginBottom: 0 },
                        }}
                        scroll={{ x: 520 }}
                        rowHoverable
                    />
                </div>
            )}

            <SeatTypeModal
                mode={modalType === "edit" ? "edit" : "create"}
                seatType={selected}
                open={modalType === "create" || modalType === "edit"}
                onClose={closeModal}
            />
            <DeleteSeatTypeModal
                seatType={selected}
                open={modalType === "delete"}
                onClose={closeModal}
            />
        </div>
    );
};

export default SeatTypeManagementPage;
