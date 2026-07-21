import "../support.css";

export default function RefundPolicy() {
    return (
        <>
            <h1 className="support-title">
                Refund Policy
            </h1>

            <p className="support-subtitle">
                Please read our refund and cancellation policy carefully before purchasing your movie tickets.
            </p>

            <div className="support-card">

                <h2>Ticket Cancellation</h2>

                <p>
                    Customers may request a ticket cancellation before the movie
                    starts, subject to the conditions below.
                </p>

                <ul>
                    <li>Refund requests must be made at least <strong>10 minutes</strong> before the showtime.</li>
                    <li>Tickets cannot be cancelled after the movie has started.</li>
                    <li>Tickets purchased with promotional vouchers may not be refundable.</li>
                </ul>

                <h2>Refund Method</h2>

                <p>
                    Approved refunds will be returned using the same payment
                    method used during the original purchase.
                </p>

                <ul>
                    <li>Credit/Debit Card: 3 - 7 business days.</li>
                    <li>E-Wallet: Within 24 hours.</li>
                    <li>Cash purchases: Refund directly at the cinema counter.</li>
                </ul>

                <h2>Important Notes</h2>

                <ul>
                    <li>Processing time may vary depending on your payment provider.</li>
                    <li>Refund requests may be declined if the ticket has already been checked in.</li>
                    <li>CGV Premium reserves the right to refuse invalid or fraudulent refund requests.</li>
                </ul>

                <p>
                    If you have any questions regarding your refund, please
                    contact our Customer Service team for assistance.
                </p>

            </div>
        </>
    );
}