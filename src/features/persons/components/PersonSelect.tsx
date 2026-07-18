import { type FC, useEffect, useMemo, useState } from "react";
import { Select, Spin } from "antd";
import PersonAvatar from "./PersonAvatar";
import PersonFormModal from "./PersonFormModal";
import { usePersonSearch } from "../hooks/usePersonSearch";
import type { PersonRef } from "../types/person.types";

interface Option {
    value: number;
    label: string;
    name: string;
    photoUrl?: string | null;
    nationality?: string | null;
}

interface Props {
    /** Selected person ids (injected by AntD Form.Item). */
    value?: number[];
    onChange?: (ids: number[]) => void;
    /** Known persons to seed labels for edit prefill. */
    seed?: PersonRef[];
    placeholder?: string;
    disabled?: boolean;
    allowQuickCreate?: boolean;
}

const PlusMini = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

/**
 * Multi-select autocomplete backed by GET /api/persons. Holds an id→PersonRef
 * cache so selected people keep their name/photo even when they fall outside the
 * current search page, and offers an inline "＋ Create new person" quick-add.
 */
const PersonSelect: FC<Props> = ({
    value = [], onChange, seed, placeholder = "Search people…", disabled, allowQuickCreate = true,
}) => {
    const [term, setTerm] = useState("");
    const [cache, setCache] = useState<Record<number, PersonRef>>({});
    const [quickOpen, setQuickOpen] = useState(false);

    const { data, isFetching } = usePersonSearch(term);

    /* Seed the cache with prefilled people. */
    useEffect(() => {
        if (!seed?.length) return;
        setCache((prev) => {
            const next = { ...prev };
            for (const p of seed) if (p.id > 0) next[p.id] = p;
            return next;
        });
    }, [seed]);

    /* Merge every search result into the cache. */
    useEffect(() => {
        if (!data?.items?.length) return;
        setCache((prev) => {
            const next = { ...prev };
            for (const p of data.items) next[p.id] = { id: p.id, name: p.name, photoUrl: p.photoUrl, nationality: p.nationality };
            return next;
        });
    }, [data]);

    /* Options = current search results ∪ selected ids (from cache), de-duplicated. */
    const options: Option[] = useMemo(() => {
        const map = new Map<number, PersonRef>();
        for (const p of data?.items ?? []) {
            map.set(p.id, { id: p.id, name: p.name, photoUrl: p.photoUrl, nationality: p.nationality });
        }
        for (const id of value) {
            if (!map.has(id)) map.set(id, cache[id] ?? { id, name: `#${id}`, photoUrl: null });
        }
        return Array.from(map.values()).map((p) => ({
            value: p.id,
            label: p.name,
            name: p.name,
            photoUrl: p.photoUrl,
            nationality: p.nationality,
        }));
    }, [data, value, cache]);

    const handleQuickCreated = (person: { id: number; name: string; photoUrl?: string | null; nationality?: string | null }) => {
        setCache((prev) => ({ ...prev, [person.id]: { id: person.id, name: person.name, photoUrl: person.photoUrl, nationality: person.nationality } }));
        onChange?.([...value, person.id]);
        setQuickOpen(false);
    };

    return (
        <>
            <Select<number[]>
                mode="multiple"
                value={value}
                onChange={(ids) => onChange?.(ids)}
                placeholder={placeholder}
                disabled={disabled}
                options={options}
                filterOption={false}
                onSearch={setTerm}
                notFoundContent={isFetching ? <Spin size="small" /> : <span style={{ fontSize: 12, color: "var(--dash-text-3)" }}>No people found</span>}
                style={{ width: "100%" }}
                optionRender={(option) => {
                    const p = option.data as Option;
                    return (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 0" }}>
                            <PersonAvatar name={p.name} photoUrl={p.photoUrl} size={28} />
                            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                                {p.nationality && <span style={{ fontSize: 11, color: "var(--dash-text-3)" }}>{p.nationality}</span>}
                            </span>
                        </div>
                    );
                }}
                labelRender={(props) => {
                    const p = cache[Number(props.value)];
                    const label = p?.name ?? (props.label != null ? String(props.label) : `#${props.value}`);
                    return (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <PersonAvatar name={label} photoUrl={p?.photoUrl} size={18} />
                            {label}
                        </span>
                    );
                }}
                popupRender={(menu) => (
                    <>
                        {menu}
                        {allowQuickCreate && (
                            <div style={{ borderTop: "1px solid var(--dash-border)", padding: 4 }}>
                                <button
                                    type="button"
                                    className="dash-icon-btn"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setQuickOpen(true)}
                                    style={{
                                        width: "100%", height: "auto", padding: "8px 10px",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                        fontSize: 13, fontWeight: 600, color: "#E8001C", borderRadius: 6,
                                    }}
                                >
                                    <PlusMini /> Create new person
                                </button>
                            </div>
                        )}
                    </>
                )}
            />

            {allowQuickCreate && (
                <PersonFormModal
                    mode="create"
                    personId={null}
                    open={quickOpen}
                    onClose={() => setQuickOpen(false)}
                    onCreated={handleQuickCreated}
                    zIndex={1200}
                />
            )}
        </>
    );
};

export default PersonSelect;
