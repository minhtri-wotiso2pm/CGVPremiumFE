import { type FC, useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import { useDebounce } from "@/hooks/useDebounce";
import { useActivityLogs, useActionTypes } from "../hooks/useActivityLogs";
import { ACTIVITY_LOG_PAGE_SIZE } from "../constants/activityLog.constants";
import LogFilters from "../components/LogFilters";
import LogTable from "../components/LogTable";
import LogDetailDrawer from "../components/LogDetailDrawer";
import "./activityLog.css";

const ActivityLogPage: FC = () => {
    const [search, setSearch] = useState("");
    const [actionType, setActionType] = useState("");
    const [module, setModule] = useState("");
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [page, setPage] = useState(1);
    const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

    const debouncedSearch = useDebounce(search, 350);

    const { data: actionTypeOptions = [] } = useActionTypes();

    const params = useMemo(() => ({
        search: debouncedSearch.trim() || undefined,
        actionType: actionType || undefined,
        module: module || undefined,
        startDate: dateRange ? dateRange[0].format("YYYY-MM-DD") : undefined,
        endDate: dateRange ? dateRange[1].format("YYYY-MM-DD") : undefined,
        page,
        pageSize: ACTIVITY_LOG_PAGE_SIZE,
    }), [debouncedSearch, actionType, module, dateRange, page]);

    const { data, isLoading, isFetching, isError, refetch } = useActivityLogs(params);

    const items = data?.items ?? [];
    const total = data?.totalItems ?? items.length;

    const hasActiveFilters = !!(search || actionType || module || dateRange);

    /* Any filter change resets pagination back to page 1. */
    const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
    const handleActionTypeChange = (v: string) => { setActionType(v); setPage(1); };
    const handleDateRangeChange = (v: [Dayjs, Dayjs] | null) => { setDateRange(v); setPage(1); };

    const handleReset = () => {
        setSearch("");
        setActionType("");
        setModule("");
        setDateRange(null);
        setPage(1);
    };

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <h1 className="dash-page-title">Activity Log</h1>
                <p className="dash-page-sub">
                    Full audit trail of administrative actions across the system. Read-only.
                </p>
            </div>

            <LogFilters
                search={search}
                onSearchChange={handleSearchChange}
                actionType={actionType}
                onActionTypeChange={handleActionTypeChange}
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onReset={handleReset}
                actionTypeOptions={actionTypeOptions}
                hasActiveFilters={hasActiveFilters}
            />

            <LogTable
                data={items}
                loading={isLoading || isFetching}
                isError={isError}
                onRetry={() => refetch()}
                page={page}
                pageSize={ACTIVITY_LOG_PAGE_SIZE}
                total={total}
                onPageChange={setPage}
                onViewDetail={setSelectedLogId}
            />

            <LogDetailDrawer logId={selectedLogId} onClose={() => setSelectedLogId(null)} />
        </div>
    );
};

export default ActivityLogPage;
