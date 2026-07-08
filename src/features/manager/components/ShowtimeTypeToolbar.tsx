import { type FC } from "react";
import { Input, Select } from "antd";
import { STATUS_FILTER_OPTIONS, SORT_OPTIONS } from "../constants/showtimeType.constants";

const { Search } = Input;

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

interface Props {
    search: string;
    onSearchChange: (v: string) => void;
    status: string;
    onStatusChange: (v: string) => void;
    sort: string;
    onSortChange: (v: string) => void;
    onAdd: () => void;
}

const ShowtimeTypeToolbar: FC<Props> = ({
    search, onSearchChange,
    status, onStatusChange,
    sort, onSortChange,
    onAdd,
}) => (
    <div className="dash-toolbar">
        <div className="dash-toolbar__left">
            <Search
                placeholder="Search by name..."
                allowClear
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ width: 240 }}
            />
            <Select
                value={status}
                onChange={onStatusChange}
                options={STATUS_FILTER_OPTIONS}
                style={{ width: 140 }}
            />
            <Select
                value={sort}
                onChange={onSortChange}
                options={SORT_OPTIONS}
                style={{ width: 160 }}
            />
        </div>
        <div className="dash-toolbar__right">
            <button className="stt-btn stt-btn--primary" onClick={onAdd}>
                <PlusIcon />
                Add Showtime Type
            </button>
        </div>
    </div>
);

export default ShowtimeTypeToolbar;
