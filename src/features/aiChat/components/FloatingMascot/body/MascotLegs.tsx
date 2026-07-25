import type { FC } from "react";
import SvgLayer from "./SvgLayer";
import leftLegSvg from "../assets/left-leg.svg?raw";
import rightLegSvg from "../assets/right-leg.svg?raw";
import leftShoeSvg from "../assets/left-shoe.svg?raw";
import rightShoeSvg from "../assets/right-shoe.svg?raw";

const MascotLegs: FC = () => (
    <>
        <SvgLayer raw={leftLegSvg} />
        <SvgLayer raw={rightLegSvg} />
        <SvgLayer raw={leftShoeSvg} />
        <SvgLayer raw={rightShoeSvg} />
    </>
);

export default MascotLegs;
