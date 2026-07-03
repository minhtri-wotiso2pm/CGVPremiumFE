import { useEffect, useState } from "react";

/**
 * Returns true only on the very first mount after page load, so entrance
 * animations synced to the Splash Screen play exactly once — remounts
 * caused by route changes skip the intro entirely.
 */
let introConsumed = false;

export function useIntroEntrance(): boolean {
    const [playIntro] = useState(() => !introConsumed);

    useEffect(() => {
        introConsumed = true;
    }, []);

    return playIntro;
}
