import type { FC } from "react";
import "./movies.css";

const MovieDetailSkeleton: FC = () => (
    <div className="cgv-detail-skeleton">
        {/* Hero skeleton */}
        <div className="cgv-detail-skeleton__hero">
            <div className="cgv-detail-skeleton__poster cgv-skeleton" />
            <div className="cgv-detail-skeleton__info">
                <div className="cgv-skeleton" style={{ height: 14, width: 120, marginBottom: 16, borderRadius: 6 }} />
                <div className="cgv-skeleton" style={{ height: 40, width: "80%", marginBottom: 12, borderRadius: 8 }} />
                <div className="cgv-skeleton" style={{ height: 20, width: 200, marginBottom: 24, borderRadius: 6 }} />
                {[160, 240, 180].map((w, i) => (
                    <div key={i} className="cgv-skeleton" style={{ height: 14, width: w, marginBottom: 12, borderRadius: 6 }} />
                ))}
                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                    <div className="cgv-skeleton" style={{ height: 44, width: 140, borderRadius: 10 }} />
                    <div className="cgv-skeleton" style={{ height: 44, width: 140, borderRadius: 10 }} />
                </div>
            </div>
        </div>

        {/* Synopsis skeleton */}
        <div className="cgv-detail-skeleton__section">
            <div className="cgv-skeleton" style={{ height: 20, width: 120, marginBottom: 16, borderRadius: 6 }} />
            {[100, 90, 95, 60].map((w, i) => (
                <div key={i} className="cgv-skeleton" style={{ height: 13, width: `${w}%`, marginBottom: 10, borderRadius: 6 }} />
            ))}
        </div>

        {/* Trailer skeleton */}
        <div className="cgv-detail-skeleton__section">
            <div className="cgv-skeleton" style={{ height: 20, width: 100, marginBottom: 16, borderRadius: 6 }} />
            <div className="cgv-skeleton" style={{ width: "100%", paddingTop: "56.25%", borderRadius: 12 }} />
        </div>
    </div>
);

export default MovieDetailSkeleton;
