import { type FC } from "react";
import { Select } from "antd";
import { useCinemas } from "@/features/manager/hooks/useCinemas";

interface Props {
    value?: number;
    onChange?: (value: number) => void;
    placeholder?: string;
}

/** Cinema picker showing name + address instead of a raw ID. */
const CinemaSelect: FC<Props> = ({ value, onChange, placeholder = "Select a cinema" }) => {
    const { data: cinemas = [], isLoading } = useCinemas();

    const options = cinemas.map((c) => ({
        value: c.cinemaId,
        searchText: `${c.cinemaName} ${c.address}`,
        label: (
            <div style={{ display: "flex", flexDirection: "column", padding: "2px 0" }}>
                <span style={{ fontWeight: 600 }}>{c.cinemaName}</span>
                <span style={{ fontSize: 12, color: "var(--dash-text-3, rgba(0,0,0,0.45))" }}>{c.address}</span>
            </div>
        ),
    }));

    return (
        <Select
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            loading={isLoading}
            showSearch
            options={options}
            filterOption={(input, option) =>
                (option?.searchText ?? "").toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={isLoading ? "Loading..." : "No cinemas found"}
        />
    );
};

export default CinemaSelect;
