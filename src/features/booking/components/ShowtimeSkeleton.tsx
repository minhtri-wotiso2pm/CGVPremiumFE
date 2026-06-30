import type { FC } from "react";

const ShowtimeSkeleton: FC = () => (
    <div className="cgv-st-selection" aria-hidden="true">
        {/* Date skeleton */}
        <div className="cgv-st-section">
            <div className="cgv-st-skel cgv-st-skel-title" style={{ width: 60 }} />
            <div style={{ display: "flex", gap: 8 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="cgv-st-skel cgv-st-skel-date" />
                ))}
            </div>
        </div>

        {/* Cinema skeleton */}
        <div className="cgv-st-section">
            <div className="cgv-st-skel cgv-st-skel-title" style={{ width: 70 }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[100, 160, 130, 145].map((w, i) => (
                    <div key={i} className="cgv-st-skel cgv-st-skel-cinema" style={{ width: w }} />
                ))}
            </div>
        </div>

        {/* Room type skeleton */}
        <div className="cgv-st-section">
            <div className="cgv-st-skel cgv-st-skel-title" style={{ width: 80 }} />
            <div style={{ display: "flex", gap: 6 }}>
                {[50, 90, 60, 70].map((w, i) => (
                    <div key={i} className="cgv-st-skel cgv-st-skel-roomtype" style={{ width: w }} />
                ))}
            </div>
        </div>

        {/* Showtime cards skeleton */}
        <div className="cgv-st-section">
            <div className="cgv-st-skel cgv-st-skel-title" style={{ width: 100 }} />
            <div className="cgv-st-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="cgv-st-skel cgv-st-skel-card" />
                ))}
            </div>
        </div>
    </div>
);

export const ShowtimeMovieInfoSkeleton: FC = () => (
    <div className="cgv-st-movie-card" aria-hidden="true">
        <div className="cgv-st-skel cgv-st-skel-poster" />
        <div className="cgv-st-movie-body" style={{ gap: 12 }}>
            <div className="cgv-st-skel cgv-st-skel-title" />
            <div style={{ display: "flex", gap: 8 }}>
                <div className="cgv-st-skel cgv-st-skel-badge" />
                <div className="cgv-st-skel cgv-st-skel-duration" />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
                {[56, 48, 64].map((w, i) => (
                    <div key={i} className="cgv-st-skel cgv-st-skel-genre" style={{ width: w }} />
                ))}
            </div>
        </div>
    </div>
);

export const ShowtimeGridSkeleton: FC = () => (
    <div className="cgv-st-grid" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="cgv-st-skel cgv-st-skel-card" style={{ animationDelay: `${i * 0.06}s` }} />
        ))}
    </div>
);

export default ShowtimeSkeleton;
