import type { FC } from "react";

const CinemaScreen: FC = () => (
    <div className="cgv-seats-screen-wrapper" aria-hidden="true">
        <span className="cgv-seats-screen" />
        <span className="cgv-seats-screen-label">SCREEN</span>
    </div>
);

export default CinemaScreen;
