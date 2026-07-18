import { type FC } from "react";
import { Button, Input, Tooltip } from "antd";

const { Search } = Input;

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const RefreshIcon = ({ spin }: { spin: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: "transform 0.5s", transform: spin ? "rotate(360deg)" : "rotate(0deg)" }}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
);

interface Props {
    search: string;
    isRefreshing: boolean;
    onSearchChange: (v: string) => void;
    onRefresh: () => void;
    onAdd: () => void;
}

const PersonToolbar: FC<Props> = ({ search, isRefreshing, onSearchChange, onRefresh, onAdd }) => (
    <div className="dash-toolbar">
        <div className="dash-toolbar__left">
            <Search
                placeholder="Search by name…"
                allowClear
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ width: 260 }}
            />
        </div>
        <div className="dash-toolbar__right">
            <Tooltip title="Refresh data">
                <button className="dash-icon-btn" onClick={onRefresh} aria-label="Refresh" disabled={isRefreshing}>
                    <RefreshIcon spin={isRefreshing} />
                </button>
            </Tooltip>
            <Button type="primary" icon={<PlusIcon />} onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                Add Person
            </Button>
        </div>
    </div>
);

export default PersonToolbar;
