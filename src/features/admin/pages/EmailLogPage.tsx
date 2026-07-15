import { type FC, useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import { useDebounce } from "@/hooks/useDebounce";
import { useEmailLogs } from "../hooks/useEmailLogs";
import { EMAIL_LOG_PAGE_SIZE } from "../constants/emailLog.constants";
import type { DeliveryStatus } from "../types/emailLog.types";
import EmailLogFilters from "../components/EmailLogFilters";
import EmailLogTable from "../components/EmailLogTable";

const EmailLogPage: FC = () => {
    const [recipientEmail, setRecipientEmail] = useState("");
    const [eventType, setEventType] = useState("");
    const [deliveryStatus, setDeliveryStatus] = useState("");
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [page, setPage] = useState(1);

    const debouncedEmail = useDebounce(recipientEmail, 350);

    const params = useMemo(() => ({
        recipientEmail: debouncedEmail.trim() || undefined,
        eventType: eventType || undefined,
        deliveryStatus: (deliveryStatus || undefined) as DeliveryStatus | undefined,
        fromDate: dateRange ? dateRange[0].format("YYYY-MM-DD") : undefined,
        toDate: dateRange ? dateRange[1].format("YYYY-MM-DD") : undefined,
        page,
        pageSize: EMAIL_LOG_PAGE_SIZE,
    }), [debouncedEmail, eventType, deliveryStatus, dateRange, page]);

    const { data, isLoading, isFetching, isError, refetch } = useEmailLogs(params);

    const items = data?.items ?? [];
    const total = data?.totalItems ?? items.length;

    const hasActiveFilters = !!(recipientEmail || eventType || deliveryStatus || dateRange);

    const handleRecipientEmailChange = (v: string) => { setRecipientEmail(v); setPage(1); };
    const handleEventTypeChange = (v: string) => { setEventType(v); setPage(1); };
    const handleDeliveryStatusChange = (v: string) => { setDeliveryStatus(v); setPage(1); };
    const handleDateRangeChange = (v: [Dayjs, Dayjs] | null) => { setDateRange(v); setPage(1); };

    const handleReset = () => {
        setRecipientEmail("");
        setEventType("");
        setDeliveryStatus("");
        setDateRange(null);
        setPage(1);
    };

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <h1 className="dash-page-title">Email Logs</h1>
                <p className="dash-page-sub">
                    Delivery history for system emails — booking confirmations, receipts, password resets, and more. Read-only.
                </p>
            </div>

            <EmailLogFilters
                recipientEmail={recipientEmail}
                onRecipientEmailChange={handleRecipientEmailChange}
                eventType={eventType}
                onEventTypeChange={handleEventTypeChange}
                deliveryStatus={deliveryStatus}
                onDeliveryStatusChange={handleDeliveryStatusChange}
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onReset={handleReset}
                hasActiveFilters={hasActiveFilters}
            />

            <EmailLogTable
                data={items}
                loading={isLoading || isFetching}
                isError={isError}
                onRetry={() => refetch()}
                page={page}
                pageSize={EMAIL_LOG_PAGE_SIZE}
                total={total}
                onPageChange={setPage}
            />
        </div>
    );
};

export default EmailLogPage;
