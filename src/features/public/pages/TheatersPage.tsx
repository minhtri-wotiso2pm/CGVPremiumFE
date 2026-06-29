export default function TheatersPage() {
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
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "0.02em" }}>
                Theaters
            </h1>
            <p style={{ margin: 0, color: "#a08888", fontSize: 15 }}>
                Coming soon — theater listings will appear here.
            </p>
        </div>
    );
}
