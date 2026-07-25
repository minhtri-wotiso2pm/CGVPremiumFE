import type { FC } from "react";
import SvgLayer from "./SvgLayer";
import zzzSvg from "../assets/zzz.svg?raw";
import { zzzVariants } from "../animations/variants";

interface Props {
    state: string;
}

const MascotZzz: FC<Props> = ({ state }) => (
    <SvgLayer raw={zzzSvg} variants={zzzVariants} animate={state === "sleep" ? "sleep" : "idle"} />
);

export default MascotZzz;
