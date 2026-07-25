import { useEffect, useRef, useState, type FC } from "react";
import SvgLayer from "./SvgLayer";
import eyesSvg from "../assets/eyes.svg?raw";
import eyesClosedSvg from "../assets/eyes-closed.svg?raw";
import eyebrowsSvg from "../assets/eyebrows.svg?raw";
import mouthSvg from "../assets/mouth.svg?raw";
import mouthHappySvg from "../assets/mouth-happy.svg?raw";
import {
    eyesVariants,
    mouthVariants,
    mouthHappyVariants,
} from "../animations/variants";

interface Props {
    state: string;
}

const BLINK_INTERVAL_MIN = 5000;
const BLINK_INTERVAL_MAX = 8000;
const BLINK_DURATION = 120;
const LOOK_INTERVAL_MIN = 10000;
const LOOK_INTERVAL_MAX = 20000;
const LOOK_DURATION = 600;

function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MascotFace: FC<Props> = ({ state }) => {
    const [blinking, setBlinking] = useState(false);
    const [lookingDir, setLookingDir] = useState(0);
    const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const blinkEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lookTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lookEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (state !== "idle") {
            if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
            if (blinkEndTimerRef.current) clearTimeout(blinkEndTimerRef.current);
            if (lookTimerRef.current) clearTimeout(lookTimerRef.current);
            if (lookEndTimerRef.current) clearTimeout(lookEndTimerRef.current);
            return;
        }

        const scheduleBlink = () => {
            blinkTimerRef.current = setTimeout(() => {
                setBlinking(true);
                blinkEndTimerRef.current = setTimeout(() => {
                    setBlinking(false);
                    scheduleBlink();
                }, BLINK_DURATION);
            }, randomBetween(BLINK_INTERVAL_MIN, BLINK_INTERVAL_MAX));
        };

        const scheduleLook = () => {
            lookTimerRef.current = setTimeout(() => {
                const dir = Math.random() > 0.5 ? 4 : -4;
                setLookingDir(dir);
                lookEndTimerRef.current = setTimeout(() => {
                    setLookingDir(0);
                    scheduleLook();
                }, LOOK_DURATION);
            }, randomBetween(LOOK_INTERVAL_MIN, LOOK_INTERVAL_MAX));
        };

        scheduleBlink();
        scheduleLook();

        return () => {
            if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
            if (blinkEndTimerRef.current) clearTimeout(blinkEndTimerRef.current);
            if (lookTimerRef.current) clearTimeout(lookTimerRef.current);
            if (lookEndTimerRef.current) clearTimeout(lookEndTimerRef.current);
        };
    }, [state]);

    const eyeAnimate = state === "thinking" ? "thinking" : "idle";

    return (
        <>
            {blinking ? (
                <SvgLayer raw={eyesClosedSvg} />
            ) : (
                <SvgLayer
                    raw={eyesSvg}
                    variants={eyesVariants}
                    animate={lookingDir !== 0 ? "lookingAround" : eyeAnimate}
                />
            )}
            <SvgLayer raw={eyebrowsSvg} />
            <SvgLayer raw={mouthSvg} variants={mouthVariants} animate={state} />
            <SvgLayer
                raw={mouthHappySvg}
                variants={mouthHappyVariants}
                animate={state}
            />
        </>
    );
};

export default MascotFace;
