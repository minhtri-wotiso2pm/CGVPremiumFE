import { type FC } from "react";
import { Input, Select, DatePicker, Button, Tooltip } from "antd";
import type { Dayjs } from "dayjs";
import type { ActionTypeOption } from "../types/activityLog.types";

const { RangePicker } = DatePicker;
const { Search } = Input;

const ResetIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
);

interface Props {
    search: string;
    onSearchChange: (v: string) => void;
    actionType: string;
    onActionTypeChange: (v: string) => void;
    dateRange: [Dayjs, Dayjs] | null;
    onDateRangeChange: (v: [Dayjs, Dayjs] | null) => void;
    onReset: () => void;
    actionTypeOptions: ActionTypeOption[];
    hasActiveFilters: boolean;
}

const LogFilters: FC<Props> = ({
    search, onSearchChange,
    actionType, onActionTypeChange,
    dateRange, onDateRangeChange,
    onReset,
    actionTypeOptions,
    hasActiveFilters,
}) => (
    <div className="dash-toolbar">
        <div className="dash-toolbar__left">
            <Search
                placeholder="Search by description or actor name..."
                allowClear
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ width: 260 }}
            />
            <Select
                value={actionType || "all"}
                onChange={(v) => onActionTypeChange(v === "all" ? "" : v)}
                style={{ width: 190 }}
                showSearch
                optionFilterProp="label"
                options={[
                    { value: "all", label: "All Action Types" },
                    ...actionTypeOptions,
                ]}
            />
            <RangePicker
                value={dateRange}
                onChange={(vals) => {
                    if (vals && vals[0] && vals[1]) onDateRangeChange([vals[0], vals[1]]);
                    else onDateRangeChange(null);
                }}
                format="DD/MM/YYYY"
                allowClear
            />
        </div>
        <div className="dash-toolbar__right">
            <Tooltip title="Reset filters">
                <Button
                    icon={<ResetIcon />}
                    onClick={onReset}
                    disabled={!hasActiveFilters}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                    Reset
                </Button>
            </Tooltip>
        </div>
    </div>
);

export default LogFilters;
