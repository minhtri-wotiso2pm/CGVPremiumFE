import { type FC } from "react";
import { Table, Progress } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MoviePerformanceRow } from "../types/report.types";

const formatVnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")} ₫`;

interface Props {
    data: MoviePerformanceRow[];
    loading: boolean;
}

const MoviePerformanceTable: FC<Props> = ({ data, loading }) => {
    const columns: ColumnsType<MoviePerformanceRow> = [
        {
            title: "#",
            key: "index",
            width: 52,
            render: (_, __, i) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
            ),
        },
        {
            title: "Movie",
            dataIndex: "title",
            key: "title",
            render: (title: string) => (
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>{title}</span>
            ),
        },
        {
            title: "Showtimes",
            dataIndex: "showtimeCount",
            key: "showtimeCount",
            width: 110,
            align: "right",
            render: (v: number) => <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{v}</span>,
            responsive: ["md"],
        },
        {
            title: "Bookings",
            dataIndex: "bookingCount",
            key: "bookingCount",
            width: 100,
            align: "right",
            render: (v: number) => <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{v}</span>,
            responsive: ["md"],
        },
        {
            title: "Tickets",
            dataIndex: "ticketsSold",
            key: "ticketsSold",
            width: 100,
            align: "right",
            render: (v: number) => <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{v.toLocaleString("vi-VN")}</span>,
        },
        {
            title: "Occupancy",
            dataIndex: "occupancyRate",
            key: "occupancyRate",
            width: 150,
            render: (rate: number) => {
                const pct = Math.round((rate ?? 0) * 100);
                return (
                    <Progress
                        percent={pct}
                        size="small"
                        strokeColor="#E8001C"
                        format={(p) => `${p}%`}
                    />
                );
            },
            responsive: ["lg"],
        },
        {
            title: "Revenue",
            dataIndex: "revenue",
            key: "revenue",
            width: 150,
            align: "right",
            render: (v: number) => (
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text-1)" }}>{formatVnd(v)}</span>
            ),
            sorter: (a, b) => a.revenue - b.revenue,
            defaultSortOrder: "descend",
        },
    ];

    return (
        <div className="dash-card" style={{ overflow: "hidden" }}>
            <Table<MoviePerformanceRow>
                dataSource={data}
                columns={columns}
                rowKey="movieId"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    hideOnSinglePage: true,
                    showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} movies`,
                    style: { padding: "12px 16px", marginBottom: 0 },
                }}
                scroll={{ x: 720 }}
                rowHoverable
            />
        </div>
    );
};

export default MoviePerformanceTable;
