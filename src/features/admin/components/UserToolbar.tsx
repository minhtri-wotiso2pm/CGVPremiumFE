import { type FC } from "react";
import { Input, Select, Button } from "antd";
import { ROLE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "../constants/admin.constants";

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

interface Props {
    search: string;
    role: string;
    status: string;
    onSearchChange: (v: string) => void;
    onRoleChange: (v: string) => void;
    onStatusChange: (v: string) => void;
    onCreateClick: () => void;
}

const UserToolbar: FC<Props> = ({
    search, role, status,
    onSearchChange, onRoleChange, onStatusChange, onCreateClick,
}) => (
    <div className="dash-toolbar">
        <div className="dash-toolbar__left">
            <Input
                placeholder="Search by name or email…"
                prefix={<SearchIcon />}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                allowClear
                style={{ minWidth: 220, maxWidth: 320 }}
            />
            <Select
                value={role}
                onChange={onRoleChange}
                options={ROLE_FILTER_OPTIONS}
                style={{ width: 148 }}
            />
            <Select
                value={status}
                onChange={onStatusChange}
                options={STATUS_FILTER_OPTIONS}
                style={{ width: 148 }}
            />
        </div>
        <div className="dash-toolbar__right">
            <Button
                type="primary"
                icon={<PlusIcon />}
                onClick={onCreateClick}
                style={{ background: "#E8001C", borderColor: "#E8001C" }}
            >
                Add User
            </Button>
        </div>
    </div>
);

export default UserToolbar;
