import { useEffect, type FC } from "react";
import "./SplashScreen.css";

const TOTAL_MS = 1550; // CSS animation ends at 1500ms + 50ms buffer before unmount

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: FC<SplashScreenProps> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, TOTAL_MS);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="cgv-splash" role="presentation" aria-hidden="true">
            <div className="cgv-splash__center">
                <div className="cgv-splash__logo-wrapper">
                    <span className="cgv-splash__logo-text">CGVPREMIUM</span>
                    <span className="cgv-splash__logo-dot" />
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
