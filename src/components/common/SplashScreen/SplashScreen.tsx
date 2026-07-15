import { useEffect, type FC } from "react";
import "./SplashScreen.css";

// Timeline: hold(200) + reveal(500, starts@200) + glow(400, starts@700)
// + fade(250, starts@1100) = 1350ms animation end, +50ms buffer before unmount.
// Exported so post-splash entrance animations (header, hero) can sync to it.
export const SPLASH_TOTAL_MS = 1400;

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: FC<SplashScreenProps> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, SPLASH_TOTAL_MS);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="cgv-splash" role="presentation" aria-hidden="true">
            <div className="cgv-splash__beam" />
            <div className="cgv-splash__center">
                <div className="cgv-splash__logo-wrapper">
                    <span className="cgv-splash__logo-text">CVPREMIUM</span>
                    <span className="cgv-splash__logo-dot" />
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
