import "../support.css";

export default function HelpCenter() {
    return (
        <>
            <h1 className="support-title">
                Help Center
            </h1>

            <p className="support-subtitle">
                Everything you need to know about booking, tickets and your cinema experience.
            </p>

            <div className="support-card">
                <h2>Getting Started</h2>

                <p>
                    Welcome to CGV Premium. Here you can easily browse movies,
                    select seats, purchase food & beverages, pay securely,
                    and manage your tickets.
                </p>

                <h3>Need help?</h3>

                <ul>
                    <li>Booking issues</li>
                    <li>Payment issues</li>
                    <li>Seat selection</li>
                    <li>Ticket information</li>
                    <li>Refund requests</li>
                </ul>
            </div>
        </>
    );
}