import type { FC } from "react";
import SvgLayer from "./SvgLayer";
import leftArmSvg from "../assets/left-arm.svg?raw";
import rightArmSvg from "../assets/right-arm.svg?raw";
import leftHandSvg from "../assets/left-hand.svg?raw";
import rightHandSvg from "../assets/right-hand.svg?raw";
import { leftArmVariants, rightArmVariants } from "../animations/variants";

interface Props {
    state: string;
}

const armStyle = { transformOrigin: "36px 128px" };
const rightArmStyle = { transformOrigin: "164px 128px" };

const MascotArms: FC<Props> = ({ state }) => (
    <>
        <SvgLayer
            raw={leftArmSvg}
            style={armStyle}
            variants={leftArmVariants}
            animate={state}
        />
        <SvgLayer
            raw={rightArmSvg}
            style={rightArmStyle}
            variants={rightArmVariants}
            animate={state}
        />
        <SvgLayer
            raw={leftHandSvg}
            style={armStyle}
            variants={leftArmVariants}
            animate={state}
        />
        <SvgLayer
            raw={rightHandSvg}
            style={rightArmStyle}
            variants={rightArmVariants}
            animate={state}
        />
    </>
);

export default MascotArms;
