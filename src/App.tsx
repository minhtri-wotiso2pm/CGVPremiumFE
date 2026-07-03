import { useState } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "@/routes";
import SplashScreen from "@/components/common/SplashScreen/SplashScreen";

function App() {
    const [splashDone, setSplashDone] = useState(false);

    return (
        <>
            {!splashDone && (
                <SplashScreen onComplete={() => setSplashDone(true)} />
            )}
            <RouterProvider router={router} />
        </>
    );
}

export default App;