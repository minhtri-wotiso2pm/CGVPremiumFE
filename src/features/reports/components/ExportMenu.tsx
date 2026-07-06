import { type FC } from "react";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import type { ReportExportFormat, ReportQuery } from "../types/report.types";
import { EXPORT_TYPE_OPTIONS } from "../constants/report.constants";
import { useExportReport } from "../hooks/useReports";

const DownIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
const ExportIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

interface Props {
    query: ReportQuery;
    disabled?: boolean;
}

/** Two export triggers (PDF / Excel), each opening a menu of report types
 *  (Revenue / F&B / Occupancy) — matches the real backend contract
 *  (`format=pdf|excel`, `reportType=revenue|fnb|occupancy`). */
const ExportMenu: FC<Props> = ({ query, disabled }) => {
    const { mutate: exportReport, isPending, variables } = useExportReport();

    const runExport = (format: ReportExportFormat) => (menu: Parameters<NonNullable<MenuProps["onClick"]>>[0]) => {
        exportReport({ ...query, format, reportType: menu.key as "revenue" | "fnb" | "occupancy" });
    };

    const menuFor = (format: ReportExportFormat): MenuProps => ({
        items: EXPORT_TYPE_OPTIONS.map((o) => ({ key: o.value, label: o.label })),
        onClick: runExport(format),
    });

    const isDownloading = (format: ReportExportFormat) => isPending && variables?.format === format;

    return (
        <div className="rpt-export-group">
            <Dropdown menu={menuFor("pdf")} trigger={["click"]} disabled={disabled || isPending}>
                <Button loading={isDownloading("pdf")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ExportIcon />
                    {isDownloading("pdf") ? "Downloading…" : "Export PDF"}
                    <DownIcon />
                </Button>
            </Dropdown>
            <Dropdown menu={menuFor("excel")} trigger={["click"]} disabled={disabled || isPending}>
                <Button
                    type="primary"
                    loading={isDownloading("excel")}
                    style={{ background: "#E8001C", borderColor: "#E8001C", display: "flex", alignItems: "center", gap: 6 }}
                >
                    <ExportIcon />
                    {isDownloading("excel") ? "Downloading…" : "Export Excel"}
                    <DownIcon />
                </Button>
            </Dropdown>
        </div>
    );
};

export default ExportMenu;
