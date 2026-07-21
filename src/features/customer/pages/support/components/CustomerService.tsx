import "../support.css";

export default function CustomerService() {
    return (
        <>
            <h1 className="support-title">
                Customer Service
            </h1>

            <p className="support-subtitle">
                Our customer support team is always ready to assist you with any issues regarding your booking experience.
            </p>

            <div className="support-card">

                <h2>Contact Information</h2>

                <p>
                    If you experience problems with booking tickets,
                    online payments, memberships, vouchers, or your account,
                    please contact us using one of the methods below.
                </p>

                <ul>
                    <li><strong>Hotline:</strong> 1900 6017</li>
                    <li><strong>Email:</strong> support@cgvpremium.vn</li>
                    <li><strong>Working Hours:</strong> 08:00 - 00:00 (Daily)</li>
                </ul>

                <h2>Support Services</h2>

                <ul>
                    <li>Ticket booking assistance</li>
                    <li>Payment troubleshooting</li>
                    <li>Membership account support</li>
                    <li>Voucher & promotion inquiries</li>
                    <li>Refund & cancellation requests</li>
                </ul>

                <p>
                    We strive to respond to all inquiries within 24 hours.
                </p>

            </div>
        </>
    );
}