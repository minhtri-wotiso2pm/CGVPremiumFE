import { useRef, useEffect, type FC } from "react";
import { motion, type Variants, type TargetAndTransition } from "framer-motion";
import { extractSvgInner } from "../utils/svgLoader";

interface SvgLayerProps {
    raw: string;
    variants?: Variants;
    animate?: string;
    initial?: string;
    exit?: string;
    style?: React.CSSProperties;
}

const SvgLayer: FC<SvgLayerProps> = ({ raw, ...motionProps }) => {
    const ref = useRef<SVGGElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = extractSvgInner(raw);
        }
    }, [raw]);

    return <motion.g ref={ref} {...motionProps} />;
};

export default SvgLayer;
