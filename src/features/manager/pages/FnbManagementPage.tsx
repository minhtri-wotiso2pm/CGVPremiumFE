import { type FC, useMemo, useState } from "react";
import { Button } from "antd";
import { useFnbProductList } from "../hooks/useFnbProductList";
import type { FnbProduct, FnbModalType } from "../types/fnb-mgmt.types";
import FnbProductToolbar from "../components/FnbProductToolbar";
import FnbProductTable from "../components/FnbProductTable";
import FnbProductFormModal from "../components/FnbProductFormModal";
import DeleteFnbProductModal from "../components/DeleteFnbProductModal";

const PAGE_SIZE = 10;

/* ── Icons ── */
const BagIcon = () => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
    </svg>
);

const AlertIcon = () => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

/* ── Stat pill ── */
const StatPill: FC<{ label: string; value: number; color?: "green" | "yellow" | "red" | "muted" }> = ({
    label, value, color = "muted",
}) => {
    const bg = color === "green"  ? "rgba(34,197,94,0.06)"
             : color === "yellow" ? "rgba(217,119,6,0.06)"
             : color === "red"    ? "rgba(232,0,28,0.06)"
             : "rgba(0,0,0,0.03)";
    const border = color === "green"  ? "rgba(34,197,94,0.18)"
                 : color === "yellow" ? "rgba(217,119,6,0.18)"
                 : color === "red"    ? "rgba(232,0,28,0.14)"
                 : "var(--dash-border)";
    const dot = color === "green"  ? "#22c55e"
              : color === "yellow" ? "#d97706"
              : color === "red"    ? "#E8001C"
              : "var(--dash-text-3)";

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 20,
            background: bg, border: `1px solid ${border}`,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text-1)", fontVariantNumeric: "tabular-nums" }}>
                {value}
            </span>
            <span style={{ fontSize: 12, color: "var(--dash-text-2)" }}>{label}</span>
        </div>
    );
};

/* ══════════════════════════════════════════
   FnbManagementPage
══════════════════════════════════════════ */
const FnbManagementPage: FC = () => {
    const { data: products = [], isLoading, isError, refetch, isFetching } = useFnbProductList();

    /* ── Filter state ── */
    const [search,   setSearch]   = useState("");
    const [itemType, setItemType] = useState("");
    const [status,   setStatus]   = useState("");
    const [isOnMenu, setIsOnMenu] = useState("");
    const [page,     setPage]     = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);

    /* ── Modal state ── */
    const [modalType,   setModalType]   = useState<FnbModalType | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<FnbProduct | null>(null);

    /* ── Stats ── */
    const stats = useMemo(() => ({
        total:      products.length,
        inStock:    products.filter((p) => p.status === "in_stock").length,
        lowStock:   products.filter((p) => p.status === "low_stock").length,
        outOfStock: products.filter((p) => p.status === "out_of_stock" || p.status === "inactive").length,
        onMenu:     products.filter((p) => p.isOnMenu).length,
    }), [products]);

    /* ── Client-side filter ── */
    const filtered = useMemo(() => {
        let r = products;
        const q = search.trim().toLowerCase();
        if (q)       r = r.filter((p) => p.itemName.toLowerCase().includes(q));
        if (itemType) r = r.filter((p) => p.itemType === itemType);
        if (status)  r = r.filter((p) => p.status === status);
        if (isOnMenu === "true")  r = r.filter((p) => p.isOnMenu);
        if (isOnMenu === "false") r = r.filter((p) => !p.isOnMenu);
        return r;
    }, [products, search, itemType, status, isOnMenu]);

    /* ── Pagination ── */
    const paged = useMemo(
        () => filtered.slice((page - 1) * pageSize, page * pageSize),
        [filtered, page, pageSize],
    );

    /* ── Handlers ── */
    const resetPage = () => setPage(1);

    const openModal = (type: FnbModalType, product?: FnbProduct) => {
        setSelectedProduct(product ?? null);
        setModalType(type);
    };
    const closeModal = () => {
        setModalType(null);
        setSelectedProduct(null);
    };

    const isEmpty       = !isLoading && !isError && products.length === 0;
    const isFilterEmpty = !isLoading && !isError && products.length > 0 && filtered.length === 0;

    return (
        <div className="dash-fade-in">
            {/* Page header */}
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 className="dash-page-title">F&amp;B Management</h1>
                        <p className="dash-page-sub">Manage the list of popcorn, drinks, and combos sold at the theater.</p>
                    </div>
                    {!isLoading && !isError && products.length > 0 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <StatPill label="Total"          value={stats.total}      color="muted" />
                            <StatPill label="In Stock"       value={stats.inStock}    color="green" />
                            <StatPill label="Low Stock"      value={stats.lowStock}   color="yellow" />
                            <StatPill label="Out / Inactive" value={stats.outOfStock} color="red" />
                            <StatPill label="On Menu"        value={stats.onMenu}     color="green" />
                        </div>
                    )}
                </div>
            </div>

            {/* Error state */}
            {isError && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "64px 24px", textAlign: "center" }}>
                    <div style={{ color: "var(--dash-text-3)" }}><AlertIcon /></div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>
                        Failed to Load Product List
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                        An error occurred while loading data. Please try again.
                    </p>
                    <Button onClick={() => refetch()} style={{ marginTop: 4 }}>Retry</Button>
                </div>
            )}

            {/* Empty state */}
            {isEmpty && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "72px 24px", textAlign: "center" }}>
                    <div style={{ color: "var(--dash-text-3)", opacity: 0.5 }}><BagIcon /></div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>
                        No F&amp;B Products Yet
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                        Add the first product to start selling F&amp;B.
                    </p>
                    <Button
                        type="primary"
                        icon={<PlusIcon />}
                        onClick={() => openModal("create")}
                        style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
                    >
                        Add Product
                    </Button>
                </div>
            )}

            {/* Main content */}
            {!isError && !isEmpty && (
                <>
                    <FnbProductToolbar
                        search={search}
                        itemType={itemType}
                        status={status}
                        isOnMenu={isOnMenu}
                        isRefreshing={isFetching}
                        onSearchChange={(v) => { setSearch(v); resetPage(); }}
                        onTypeChange={(v)   => { setItemType(v); resetPage(); }}
                        onStatusChange={(v) => { setStatus(v); resetPage(); }}
                        onMenuChange={(v)   => { setIsOnMenu(v); resetPage(); }}
                        onRefresh={() => refetch()}
                        onAdd={() => openModal("create")}
                    />

                    {isFilterEmpty ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "52px 24px", textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                                No Results Found
                            </p>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                                Try adjusting your keyword or filters.
                            </p>
                            <Button size="small" onClick={() => { setSearch(""); setItemType(""); setStatus(""); setIsOnMenu(""); }}>
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <FnbProductTable
                            data={paged}
                            total={filtered.length}
                            page={page}
                            pageSize={pageSize}
                            loading={isLoading}
                            onPageChange={(p, ps) => { setPage(p); setPageSize(ps); }}
                            onAction={(product, type) => openModal(type, product)}
                        />
                    )}
                </>
            )}

            {/* Modals */}
            <FnbProductFormModal
                mode={modalType === "edit" ? "edit" : "create"}
                product={selectedProduct}
                open={modalType === "create" || modalType === "edit"}
                onClose={closeModal}
            />
            <DeleteFnbProductModal
                product={selectedProduct}
                open={modalType === "delete"}
                onClose={closeModal}
            />
        </div>
    );
};

export default FnbManagementPage;
