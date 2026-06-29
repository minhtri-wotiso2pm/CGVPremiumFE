export default function PromotionsPage() {
    return (
        <div style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            color: "#f0e8e8",
        }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="#E8001C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "0.02em" }}>
                Promotions
            </h1>
            <p style={{ margin: 0, color: "#a08888", fontSize: 15 }}>
                Coming soon — exclusive offers will appear here.
            </p>
        </div>
    );
}
