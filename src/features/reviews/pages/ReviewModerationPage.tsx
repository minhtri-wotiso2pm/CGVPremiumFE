import { type FC, useMemo, useState } from "react";
import { Table, Input, Segmented, Tag, Tooltip, Popconfirm, Button, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAdminReviews, useHideReview, useUnhideReview } from "../hooks/useAdminReviews";
import type { AdminReviewItem, AdminReviewStatus } from "../types/review.types";
import { ADMIN_REVIEW_PAGE_SIZE } from "../constants/review.constants";
import StarRating from "../components/StarRating";

const { Search } = Input;

const fmtDate = (iso: string): string => {
    try {
        return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return ""; }
};

const EyeOffGlyph: FC = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A18.5 18.5 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.39-1.61" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22" />
    </svg>
);

const EyeGlyph: FC = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

const initial = (name: string) => (name.trim()[0] ?? "?").toUpperCase();

const ReviewModerationPage: FC = () => {
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState<AdminReviewStatus>("all");
    const [page, setPage] = useState(1);

    const params = useMemo(
        () => ({ page, pageSize: ADMIN_REVIEW_PAGE_SIZE, keyword: keyword || undefined, status }),
        [page, keyword, status],
    );
    const { data, isLoading, isFetching } = useAdminReviews(params);
    const { mutate: hide, isPending: hiding } = useHideReview();
    const { mutate: unhide, isPending: unhiding } = useUnhideReview();
    const busy = hiding || unhiding;

    const columns: ColumnsType<AdminReviewItem> = [
        {
            title: "Movie",
            dataIndex: "movieTitle",
            key: "movieTitle",
            render: (t: string) => (
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>{t}</span>
            ),
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            width: 128,
            render: (r: number) => <StarRating value={r} size={13} />,
        },
        {
            title: "Review",
            dataIndex: "comment",
            key: "comment",
            render: (c: string) =>
                c?.trim() ? (
                    <Tooltip title={c}>
                        <span style={{
                            fontSize: 13, color: "var(--dash-text-2)", display: "-webkit-box",
                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: 320,
                        }}>
                            {c}
                        </span>
                    </Tooltip>
                ) : (
                    <span style={{ fontSize: 13, color: "var(--dash-text-3)", fontStyle: "italic" }}>No comment</span>
                ),
        },
        {
            title: "Customer",
            key: "customer",
            width: 190,
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar size={26} src={r.customerAvatar || undefined} style={{ background: "#E8001C", fontSize: 12 }}>
                        {initial(r.customerName)}
                    </Avatar>
                    <span style={{ fontSize: 13, color: "var(--dash-text-1)" }}>{r.customerName}</span>
                </div>
            ),
        },
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 130,
            render: (d: string) => (
                <span style={{ fontSize: 12.5, color: "var(--dash-text-2)" }}>{fmtDate(d)}</span>
            ),
            responsive: ["lg"],
        },
        {
            title: "Status",
            dataIndex: "isHidden",
            key: "isHidden",
            width: 96,
            render: (hidden: boolean) =>
                hidden ? <Tag color="default">Hidden</Tag> : <Tag color="success">Active</Tag>,
        },
        {
            title: "",
            key: "actions",
            width: 120,
            align: "right",
            render: (_, r) =>
                r.isHidden ? (
                    <Popconfirm
                        title="Restore this review?"
                        description="It will appear on the movie page again."
                        okText="Restore"
                        cancelText="Cancel"
                        onConfirm={() => unhide(r.reviewId)}
                        disabled={busy}
                    >
                        <Button size="small" icon={<EyeGlyph />} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                            Unhide
                        </Button>
                    </Popconfirm>
                ) : (
                    <Popconfirm
                        title="Hide this review?"
                        description="It will be removed from the movie page and rating."
                        okText="Hide"
                        okButtonProps={{ danger: true }}
                        cancelText="Cancel"
                        onConfirm={() => hide(r.reviewId)}
                        disabled={busy}
                    >
                        <Button size="small" danger icon={<EyeOffGlyph />} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                            Hide
                        </Button>
                    </Popconfirm>
                ),
        },
    ];

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <h1 className="dash-page-title">Review Moderation</h1>
                <p className="dash-page-sub">
                    Search, review, and hide customer reviews. Hidden reviews stay stored but don't count toward a
                    movie's rating.
                </p>
            </div>

            <div className="dash-toolbar">
                <div className="dash-toolbar__left" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Search
                        placeholder="Search by customer or movie…"
                        allowClear
                        onSearch={(v) => { setKeyword(v.trim()); setPage(1); }}
                        style={{ width: 280 }}
                    />
                    <Segmented
                        value={status}
                        onChange={(v) => { setStatus(v as AdminReviewStatus); setPage(1); }}
                        options={[
                            { label: "All", value: "all" },
                            { label: "Active", value: "active" },
                            { label: "Hidden", value: "hidden" },
                        ]}
                    />
                </div>
            </div>

            <div className="dash-card" style={{ overflow: "hidden" }}>
                <Table<AdminReviewItem>
                    dataSource={data?.items ?? []}
                    columns={columns}
                    rowKey="reviewId"
                    loading={isLoading || isFetching}
                    pagination={{
                        current: page,
                        pageSize: ADMIN_REVIEW_PAGE_SIZE,
                        total: data?.totalItems ?? 0,
                        onChange: setPage,
                        showSizeChanger: false,
                        showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} reviews`,
                        style: { padding: "12px 16px", marginBottom: 0 },
                    }}
                    scroll={{ x: 820 }}
                    rowHoverable
                />
            </div>
        </div>
    );
};

export default ReviewModerationPage;
