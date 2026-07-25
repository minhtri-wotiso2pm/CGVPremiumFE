import type { FC } from "react";
import SvgLayer from "./SvgLayer";
import popcornSvg from "../assets/popcorn.svg?raw";
import { popcornVariants } from "../animations/variants";

interface Props {
    state: string;
}

const MascotPopcorn: FC<Props> = ({ state }) => (
    <SvgLayer raw={popcornSvg} variants={popcornVariants} animate={state} />
);

export default MascotPopcorn;
