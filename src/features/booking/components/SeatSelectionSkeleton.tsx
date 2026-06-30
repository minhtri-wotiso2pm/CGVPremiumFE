import type { FC } from "react";

const ROW_WIDTHS = [9, 10, 10, 11, 11, 10, 9, 8];

const SeatSelectionSkeleton: FC = () => (
    <div className="cgv-seats-page cgv-seats-fade-in">
        <div className="cgv-seats-container">
            {/* Header card skeleton */}
            <div className="cgv-seats-info-card" aria-hidden="true">
                <div
                    className="cgv-seats-skel"
                    style={{ width: 62, height: 88, borderRadius: 8, flexShrink: 0 }}
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="cgv-seats-skel" style={{ width: "58%", height: 18 }} />
                    <div style={{ display: "flex", gap: 7 }}>
                        <div className="cgv-seats-skel" style={{ width: 32, height: 20, borderRadius: 4 }} />
                        <div className="cgv-seats-skel" style={{ width: 52, height: 20, borderRadius: 4 }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <div className="cgv-seats-skel" style={{ width: "40%", height: 12 }} />
                        <div className="cgv-seats-skel" style={{ width: "25%", height: 12 }} />
                    </div>
                    <div className="cgv-seats-skel" style={{ width: "48%", height: 24, borderRadius: 6 }} />
                </div>
            </div>

            <div className="cgv-seats-layout" style={{ marginTop: 20 }}>
                {/* Left — seat map skeleton */}
                <div className="cgv-seats-left">
                    <div className="cgv-seats-map-wrapper" aria-hidden="true">
                        {/* screen */}
                        <div
                            className="cgv-seats-skel"
                            style={{ height: 4, maxWidth: 480, margin: "0 auto 36px", borderRadius: 2 }}
                        />
                        {/* rows */}
                        <div className="cgv-seats-rows">
                            {ROW_WIDTHS.map((cols, i) => (
                                <div key={i} className="cgv-seats-row" style={{ marginBottom: 5 }}>
                                    <div className="cgv-seats-skel" style={{ width: 28, height: 34, borderRadius: 4 }} />
                                    {Array.from({ length: cols }).map((_, j) => (
                                        <div
                                            key={j}
                                            className="cgv-seats-skel"
                                            style={{
                                                width: 36,
                                                height: 34,
                                                borderRadius: "7px 7px 4px 4px",
                                                animationDelay: `${(i * cols + j) * 0.02}s`,
                                            }}
                                        />
                                    ))}
                                    <div className="cgv-seats-skel" style={{ width: 28, height: 34, borderRadius: 4 }} />
                                </div>
                            ))}
                        </div>
                        {/* legend skeleton */}
                        <div
                            className="cgv-seats-legend"
                            aria-hidden="true"
                            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 18, paddingTop: 20 }}
                        >
                            {[70, 64, 90].map((w, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div className="cgv-seats-skel" style={{ width: 20, height: 18, borderRadius: "5px 5px 3px 3px" }} />
                                    <div className="cgv-seats-skel" style={{ width: w, height: 11 }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — summary skeleton */}
                <aside className="cgv-seats-right" aria-hidden="true">
                    <div className="cgv-seats-summary">
                        <div className="cgv-seats-summary__header">
                            <div className="cgv-seats-skel" style={{ width: "45%", height: 10 }} />
                        </div>
                        <div className="cgv-seats-summary__body">
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {[55, 70, 62].map((w, i) => (
                                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <div className="cgv-seats-skel" style={{ width: 44, height: 10 }} />
                                        <div className="cgv-seats-skel" style={{ width: `${w}%`, height: 10 }} />
                                    </div>
                                ))}
                            </div>
                            <div className="cgv-seats-skel" style={{ height: 28, borderRadius: 6 }} />
                            <div style={{ paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div className="cgv-seats-skel" style={{ width: 80, height: 10 }} />
                                    <div className="cgv-seats-skel" style={{ width: 20, height: 10 }} />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div className="cgv-seats-skel" style={{ width: 40, height: 12 }} />
                                    <div className="cgv-seats-skel" style={{ width: 90, height: 20 }} />
                                </div>
                            </div>
                        </div>
                        <div className="cgv-seats-summary__footer">
                            <div className="cgv-seats-skel" style={{ height: 46, borderRadius: 10 }} />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </div>
);

export default SeatSelectionSkeleton;
