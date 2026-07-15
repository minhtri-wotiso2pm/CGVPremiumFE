import { type FC } from "react";
import { Input, Select, DatePicker, Button, Tooltip } from "antd";
import type { Dayjs } from "dayjs";
import type { DeliveryStatus } from "../types/emailLog.types";
import { DELIVERY_STATUS_FILTER_OPTIONS, EMAIL_EVENT_TYPE_OPTIONS } from "../constants/emailLog.constants";

const { RangePicker } = DatePicker;
const { Search } = Input;

const ResetIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
);

interface Props {
    recipientEmail: string;
    onRecipientEmailChange: (v: string) => void;
    eventType: string;
    onEventTypeChange: (v: string) => void;
    deliveryStatus: string;
    onDeliveryStatusChange: (v: string) => void;
    dateRange: [Dayjs, Dayjs] | null;
    onDateRangeChange: (v: [Dayjs, Dayjs] | null) => void;
    onReset: () => void;
    hasActiveFilters: boolean;
}

const EmailLogFilters: FC<Props> = ({
    recipientEmail, onRecipientEmailChange,
    eventType, onEventTypeChange,
    deliveryStatus, onDeliveryStatusChange,
    dateRange, onDateRangeChange,
    onReset,
    hasActiveFilters,
}) => (
    <div className="dash-toolbar">
        <div className="dash-toolbar__left">
            <Search
                placeholder="Search by recipient email..."
                allowClear
                value={recipientEmail}
                onChange={(e) => onRecipientEmailChange(e.target.value)}
                style={{ width: 240 }}
            />
            <Select
                value={eventType || "all"}
                onChange={(v) => onEventTypeChange(v === "all" ? "" : v)}
                style={{ width: 210 }}
                showSearch
                optionFilterProp="label"
                options={[
                    { value: "all", label: "All Event Types" },
                    ...EMAIL_EVENT_TYPE_OPTIONS,
                ]}
            />
            <Select
                value={(deliveryStatus || "") as DeliveryStatus | ""}
                onChange={(v) => onDeliveryStatusChange(v)}
                style={{ width: 160 }}
                options={DELIVERY_STATUS_FILTER_OPTIONS}
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

export default EmailLogFilters;
