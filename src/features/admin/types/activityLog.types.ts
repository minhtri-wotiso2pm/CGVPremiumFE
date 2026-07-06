export interface ActivityLogActor {
    userId: number;
    fullName: string;
    role: string;
}

/** One row in the activity log list (GET /admin/activity-logs). */
export interface ActivityLogRow {
    logId: number;
    timestamp: string;
    actor: ActivityLogActor;
    actionType: string;
    module: string;
    description: string;
    ipAddress: string;
    targetUserId: number | null;
    targetTable: string | null;
    targetId: number | null;
}

export interface ActivityLogListResponse {
    items: ActivityLogRow[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

/** Full detail (GET /admin/activity-logs/{id}) — a flatter shape than the
 *  list row (actor fields inline, `createdAt` instead of `timestamp`). */
export interface ActivityLogDetail {
    logId: number;
    createdAt: string;
    actorId: number;
    actorName: string;
    actorRole: string;
    actionType: string;
    module: string;
    ipAddress: string;
    targetUserId: number | null;
    targetTable: string | null;
    targetId: number | null;
    description: string;
}

export interface ActionTypeOption {
    value: string;
    label: string;
}

export interface GetActivityLogsParams {
    actionType?: string;
    module?: string;
    actorId?: number;
    targetUserId?: number;
    targetTable?: string;
    targetId?: number;
    startDate?: string; // yyyy-MM-dd
    endDate?: string;   // yyyy-MM-dd
    /** Not part of the documented API contract — sent best-effort since
     *  the UI spec requires a free-text search box with no dedicated
     *  backend param. Harmless if the backend ignores it. */
    search?: string;
    page?: number;
    pageSize?: number;
}
