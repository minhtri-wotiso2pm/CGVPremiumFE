export type MascotState =
    | "idle"
    | "hover"
    | "wave"
    | "thinking"
    | "lookingAround"
    | "happy"
    | "sleep"
    | "error"
    | "roaming"
    | "landing";

export interface FloatingMascotProps {
    state?: MascotState;
    visible?: boolean;
    position?: "left" | "right";
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onClick?: () => void;
    onStateChange?: (state: MascotState) => void;
}
