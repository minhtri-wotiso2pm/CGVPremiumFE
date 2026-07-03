import { type FC } from "react";
import { Input, Select, Button } from "antd";
import { FNB_TYPE_FILTER_OPTIONS, FNB_STATUS_FILTER_OPTIONS } from "../types/fnb-mgmt.types";

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
);

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const ON_MENU_FILTER_OPTIONS = [
    { value: "",     label: "Tất cả menu" },
    { value: "true", label: "Đang trên menu" },
    { value: "false", label: "Đang ẩn" },
];

interface Props {
    search:         string;
    itemType:       string;
    status:         string;
    isOnMenu:       string;
    isRefreshing:   boolean;
    onSearchChange:  (v: string) => void;
    onTypeChange:    (v: string) => void;
    onStatusChange:  (v: string) => void;
    onMenuChange:    (v: string) => void;
    onRefresh:       () => void;
    onAdd:           () => void;
}

const FnbProductToolbar: FC<Props> = ({
    search, itemType, status, isOnMenu,
    isRefreshing, onSearchChange, onTypeChange, onStatusChange, onMenuChange, onRefresh, onAdd,
}) => (
    <div className="dash-toolbar">
        <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
            <Input
                prefix={<SearchIcon />}
                placeholder="Tìm tên sản phẩm..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                allowClear
                style={{ width: 220 }}
            />
            <Select
                value={itemType}
                options={FNB_TYPE_FILTER_OPTIONS}
                onChange={onTypeChange}
                style={{ width: 150 }}
            />
            <Select
                value={status}
                options={FNB_STATUS_FILTER_OPTIONS}
                onChange={onStatusChange}
                style={{ width: 160 }}
            />
            <Select
                value={isOnMenu}
                options={ON_MENU_FILTER_OPTIONS}
                onChange={onMenuChange}
                style={{ width: 150 }}
            />
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
                className="dash-icon-btn"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Làm mới"
                style={{ width: 32, height: 32 }}
            >
                <RefreshIcon />
            </button>
            <Button
                type="primary"
                icon={<PlusIcon />}
                onClick={onAdd}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
                Thêm sản phẩm
            </Button>
        </div>
    </div>
);

export default FnbProductToolbar;
