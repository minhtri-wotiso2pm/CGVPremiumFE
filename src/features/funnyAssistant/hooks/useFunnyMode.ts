import { useAppSelector } from "@/store/hooks";
import { useMembershipInfo } from "@/features/customer/hooks/useMembership";
import { funnyModeStore, useFunnySettings } from "../store/funnyModeStore";
import { useIsDesktop } from "./useEnvironment";

/* ══════════════════════════════════════════════════════════════
   useFunnyMode — the single source of truth for "should the mascot
   be alive right now?". Combines three gates:
     1. the user picked Funny mode (FunnyModeManager / store)
     2. the user is a VIP member
     3. the device is a desktop (≥1024px, fine pointer)
══════════════════════════════════════════════════════════════ */

/** Tier names that unlock the feature. Matched case-insensitively as a
 *  substring so BE naming ("VIP", "Diamond VIP", "Platinum") all pass. */
const VIP_TIER_PATTERN = /vip|diamond|platinum|premium|gold/i;

export interface FunnyModeGate {
    /** User's saved preference, regardless of eligibility. */
    mode: "normal" | "funny";
    isVip: boolean;
    isDesktop: boolean;
    /** Membership still loading — used to avoid a flash of the wrong widget. */
    isResolving: boolean;
    /** All gates pass: render the live mascot instead of the chat bubble. */
    enabled: boolean;
    setMode: (mode: "normal" | "funny") => void;
}

export function useFunnyMode(): FunnyModeGate {
    const { mode } = useFunnySettings();
    const isDesktop = useIsDesktop();
    const user = useAppSelector((state) => state.auth.user);

    // Only hit the authenticated membership endpoint when logged in — guests
    // never see the feature anyway, and this avoids a stray 401.
    const { data: membership, isLoading } = useMembershipInfo(Boolean(user));

    const isVip =
        funnyModeStore.isForceVip() ||
        (!!membership?.currentTier && VIP_TIER_PATTERN.test(membership.currentTier));

    const isResolving = Boolean(user) && isLoading;
    const enabled = mode === "funny" && isVip && isDesktop;

    return {
        mode,
        isVip,
        isDesktop,
        isResolving,
        enabled,
        setMode: funnyModeStore.setMode,
    };
}
