import type { FC } from "react";
import SvgLayer from "./SvgLayer";
import bodySvg from "../assets/body.svg?raw";
import { bodyVariants } from "../animations/variants";

interface Props {
    state: string;
}

const MascotBody: FC<Props> = ({ state }) => (
    <SvgLayer raw={bodySvg} variants={bodyVariants} animate={state} />
);

export default MascotBody;
