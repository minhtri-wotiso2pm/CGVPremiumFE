import { useState, type FC, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { ConfigProvider } from "antd";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import "./dashboard.css";

export interface MenuItem {
    key: string;
    label: string;
    icon: ReactNode;
    path: string;
    disabled?: boolean;
}

export interface MenuGroup {
    groupKey: string;
    title?: string;
    items: MenuItem[];
}

interface Props {
    menuGroups: MenuGroup[];
}

const DashboardLayout: FC<Props> = ({ menuGroups }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#E8001C",
                    fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif",
                    borderRadius: 8,
                    colorBgContainer: "#FFFFFF",
                    colorBgElevated: "#FFFFFF",
                    colorBorder: "rgba(0,0,0,0.10)",
                    colorText: "#1D1D1F",
                    colorTextSecondary: "#6E6E73",
                },
                components: {
                    Modal: {
                        titleFontSize: 16,
                        titleColor: "#1D1D1F",
                    },
                    Button: {
                        borderRadius: 8,
                        controlHeight: 36,
                    },
                    Input: {
                        borderRadius: 8,
                        controlHeight: 36,
                    },
                    Select: {
                        borderRadius: 8,
                        controlHeight: 36,
                    },
                    Table: {
                        borderRadius: 0,
                    },
                },
            }}
        >
            <div className="dash-shell">
                {/* Mobile overlay */}
                <div
                    className={`dash-overlay${mobileOpen ? " dash-overlay--show" : ""}`}
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />

                {/* Sidebar */}
                <DashboardSidebar
                    menuGroups={menuGroups}
                    collapsed={collapsed}
                    mobileOpen={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    onToggleCollapse={() => setCollapsed((v) => !v)}
                />

                {/* Main area */}
                <div className="dash-main">
                    <DashboardHeader
                        onMenuToggle={() => setMobileOpen((v) => !v)}
                    />
                    <main className="dash-content dash-fade-in">
                        <Outlet />
                    </main>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default DashboardLayout;
