/**
 * ErrorHero.tsx
 * Large glowing error code number with animated pulse ring.
 */

import type { FC } from "react";
import "@/features/common/error-pages.css";

interface Props {
    code: "404" | "403";
}

const ErrorHero: FC<Props> = ({ code }) => (
    <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
        {/* Pulse ring */}
        <div className={`ep-code-ring ep-code-ring--${code}`} aria-hidden="true" />
        {/* Number */}
        <h1 className={`ep-code ep-code--${code}`} aria-label={`Error ${code}`}>
            {code}
        </h1>
    </div>
);

export default ErrorHero;