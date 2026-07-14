import type { FC } from "react";

interface Props {
    title: string;
    value: string | number;
    color?: string;
}

const DashboardCard: FC<Props> = ({
    title,
    value,
    color = "#E8001C",
}) => {
    return (
        <div
            style={{
                background: "#161616",
                border: `1px solid ${color}`,
                borderRadius: 14,
                padding: 24,
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <div
                style={{
                    color: "#999",
                    fontSize: 14,
                }}
            >
                {title}
            </div>

            <div
                style={{
                    color: "#fff",
                    fontSize: 34,
                    fontWeight: 700,
                }}
            >
                {value}
            </div>
        </div>
    );
};

export default DashboardCard;