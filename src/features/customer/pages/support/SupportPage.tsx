import { useEffect, useState } from "react";
import "./support.css";

import HelpCenter from "./components/HelpCenter";
import CustomerService from "./components/CustomerService";
import RefundPolicy from "./components/RefundPolicy";

export default function SupportPage() {
    const [active, setActive] = useState("help");

    useEffect(() => {
        const updateFromHash = () => {
            const hash = window.location.hash.replace("#", "");

            if (!hash) return;

            setActive(hash);

            const section = document.getElementById(hash);

            if (!section) return;

            section.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

            section.classList.add("support-highlight");

            setTimeout(() => {
                section.classList.remove("support-highlight");
            }, 1000);
        };

        updateFromHash();

        window.addEventListener("hashchange", updateFromHash);

        return () => {
            window.removeEventListener("hashchange", updateFromHash);
        };
    }, []);

    const scrollToSection = (id: string) => {
        setActive(id);

        window.history.replaceState(null, "", `#${id}`);

        const section = document.getElementById(id);

        if (!section) return;

        section.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        section.classList.add("support-highlight");

        setTimeout(() => {
            section.classList.remove("support-highlight");
        }, 1000);
    };

    return (
        <div className="support-page">
            <div className="support-container">

                <aside className="support-sidebar">
                    <h2>Support Center</h2>

                    <button
                        className={active === "help" ? "active" : ""}
                        onClick={() => scrollToSection("help")}
                    >
                        Help Center
                    </button>

                    <button
                        className={active === "service" ? "active" : ""}
                        onClick={() => scrollToSection("service")}
                    >
                        Customer Service
                    </button>

                    <button
                        className={active === "refund" ? "active" : ""}
                        onClick={() => scrollToSection("refund")}
                    >
                        Refund Policy
                    </button>
                </aside>

                <main className="support-content">

                    <section
                        id="help"
                        className={`support-section ${active === "help" ? "active" : ""}`}
                    >
                        <HelpCenter />
                    </section>

                    <section
                        id="service"
                        className={`support-section ${active === "service" ? "active" : ""}`}
                    >
                        <CustomerService />
                    </section>

                    <section
                        id="refund"
                        className={`support-section ${active === "refund" ? "active" : ""}`}
                    >
                        <RefundPolicy />
                    </section>

                </main>

            </div>
        </div>
    );
}