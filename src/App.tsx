import { useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react"


import { router } from "@/routes";
import SplashScreen from "@/components/common/SplashScreen/SplashScreen";
import { useSeatHoldBackGuard } from "@/features/booking/hooks/useSeatHoldBackGuard";

function App() {
    const [splashDone, setSplashDone] = useState(false);

    // Mounted once at app root — see useSeatHoldBackGuard for why this
    // can't live inside FnbPage itself.
    useSeatHoldBackGuard();

    return (
        <>
            {!splashDone && (
                <SplashScreen onComplete={() => setSplashDone(true)} />
            )}
            <RouterProvider router={router} />
            <Analytics />
            <SpeedInsights />
        </>
    );
}

export default App;