/* Public surface of the Funny Assistant feature (Kino — the Living Sigil). */
export { default as MascotStage } from "./components/MascotStage";
export { default as AssistantSettingsCard } from "./settings/AssistantSettingsCard";
export { useFunnyMode } from "./hooks/useFunnyMode";
export { funnyModeStore, useFunnySettings } from "./store/funnyModeStore";
export type { KinoIntent, KinoState, Tone } from "./types";
