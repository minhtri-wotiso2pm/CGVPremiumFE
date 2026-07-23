import { useMotionValue } from "framer-motion";
import { Link } from "react-router-dom";
import type { ResolvedOutfit, UnlockContext } from "../types";
import { useFunnyMode } from "../hooks/useFunnyMode";
import { funnyModeStore, useFunnySettings } from "../store/funnyModeStore";
import {
    OUTFITS,
    describeUnlock,
    isUnlocked,
    resolveAccent,
    resolveEquipped,
    unlockProgress,
} from "../data/outfits";
import Sigil from "../components/Sigil";
import "../funnyAssistant.css";

/* ══════════════════════════════════════════════════════════════
   Settings → Assistant Experience card.
   Normal vs. Kino (VIP-only), a live token-tinted preview, an opt-in
   sound toggle, and the Wardrobe — a gallery of outfits with live
   previews, rarity, and lock/progress states (Apple Watch Faces feel).
══════════════════════════════════════════════════════════════ */

/** A non-interactive Sigil with fixed (zero) pupils, for previews. */
function StaticSigil({ outfit, idSuffix }: { outfit: ResolvedOutfit | null; idSuffix: string }) {
    const zx = useMotionValue(0);
    const zy = useMotionValue(0);
    return <Sigil pupilX={zx} pupilY={zy} idSuffix={idSuffix} outfit={outfit} />;
}

function KinoPreview({ outfit }: { outfit: ResolvedOutfit | null }) {
    return (
        <div className="fa-set-preview">
            <span className="fa-set-preview-label">Live preview · Kino</span>
            <div className="fa-set-preview-stage" data-awake="true" data-lit="true">
                <StaticSigil outfit={outfit} idSuffix="preview" />
            </div>
            <span className="fa-set-preview-hint">Kino thắp sáng ở góc màn hình — chạm để trò chuyện.</span>
        </div>
    );
}

const SparkleIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l1.9 5.5L19.5 9l-5.6 1.9L12 16l-1.9-5.1L4.5 9l5.6-1.5L12 2z" />
        <circle cx="18.5" cy="17.5" r="1.8" />
    </svg>
);

const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
    </svg>
);

const LockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
);

export default function AssistantSettingsCard() {
    const { mode, isVip, isDesktop, setMode } = useFunnyMode();
    const { equipped, sound, celebrations } = useFunnySettings();

    const ctx: UnlockContext = { isVip, celebrations, now: new Date() };
    const equippedOutfit = resolveEquipped(equipped, ctx);

    const options = [
        { id: "normal" as const, name: "Normal", desc: "The classic floating chat button. Calm, familiar, always in the corner." },
        { id: "funny" as const, name: "Kino", vipOnly: true, desc: "Meet Kino — a living point of light in the corner. It wakes when it matters; tap it to chat." },
    ];

    return (
        <section className="fa-set-card" aria-labelledby="fa-set-title">
            <header className="fa-set-head">
                <span className="fa-set-badge"><SparkleIcon /></span>
                <div>
                    <h2 id="fa-set-title" className="fa-set-title">Assistant Experience</h2>
                    <p className="fa-set-sub">Choose how the CGV AI assistant shows up as you browse.</p>
                </div>
            </header>

            <div className="fa-set-grid" role="radiogroup" aria-label="Assistant mode">
                {options.map((opt) => {
                    const active = mode === opt.id;
                    const locked = opt.vipOnly && !isVip;
                    return (
                        <button key={opt.id} type="button" role="radio" aria-checked={active} disabled={locked}
                            data-active={active} className="fa-set-option" onClick={() => setMode(opt.id)}>
                            <div className="fa-set-option-top">
                                <span className="fa-set-option-name">
                                    {opt.name}
                                    {opt.vipOnly && <span className="fa-set-pill">VIP Only</span>}
                                </span>
                                <span className="fa-set-radio" aria-hidden="true"><span /></span>
                            </div>
                            <span className="fa-set-option-desc">{opt.desc}</span>
                        </button>
                    );
                })}
            </div>

            {mode === "funny" && (
                <>
                    <KinoPreview outfit={equippedOutfit} />

                    {/* Opt-in sound (P2) */}
                    <div className="fa-set-toggle">
                        <div>
                            <span className="fa-set-toggle-name">Âm thanh</span>
                            <span className="fa-set-toggle-desc">Hiệu ứng âm thanh tinh tế khi Kino thức dậy hoặc bạn đặt vé xong. Mặc định tắt.</span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={sound}
                            aria-label="Bật âm thanh Kino"
                            data-on={sound}
                            className="fa-set-switch"
                            onClick={() => funnyModeStore.setSound(!sound)}
                        >
                            <span className="fa-set-switch-knob" />
                        </button>
                    </div>

                    {/* Wardrobe (P3) */}
                    <div className="fa-ward-head">
                        <h3 className="fa-ward-title">Wardrobe</h3>
                        <p className="fa-ward-sub">Mở khóa outfit bằng cách đặt vé và theo mùa. Chọn một bộ, hoặc để Kino là ánh sáng thuần.</p>
                    </div>
                    <div className="fa-ward-grid">
                        <button
                            type="button"
                            className="fa-ward-card"
                            data-active={equipped === null}
                            aria-pressed={equipped === null}
                            onClick={() => funnyModeStore.setEquipped(null)}
                        >
                            <span className="fa-ward-stage" data-awake="true" data-lit="true">
                                <StaticSigil outfit={null} idSuffix="ward-none" />
                            </span>
                            <span className="fa-ward-name">Không mặc</span>
                        </button>

                        {OUTFITS.map((o) => {
                            const unlocked = isUnlocked(o, ctx);
                            const active = equipped === o.id;
                            const preview: ResolvedOutfit = { render: o.render, accent: resolveAccent(o) };
                            const prog = unlockProgress(o, ctx);
                            return (
                                <button
                                    key={o.id}
                                    type="button"
                                    className="fa-ward-card"
                                    data-active={active}
                                    disabled={!unlocked}
                                    aria-pressed={active}
                                    aria-label={`${o.name}${unlocked ? "" : " — khóa"}`}
                                    onClick={() => unlocked && funnyModeStore.setEquipped(o.id)}
                                >
                                    {o.rarity !== "common" && (
                                        <span className="fa-ward-badge" data-rarity={o.rarity}>{o.rarity}</span>
                                    )}
                                    <span className="fa-ward-stage" data-awake="true" data-lit="true">
                                        <StaticSigil outfit={preview} idSuffix={`ward-${o.id}`} />
                                    </span>
                                    <span className="fa-ward-name">{o.name}</span>
                                    {!unlocked && (
                                        <span className="fa-ward-lock">
                                            <LockIcon />
                                            <span className="fa-ward-lock-label">{describeUnlock(o)}</span>
                                            {prog && <span className="fa-ward-lock-progress">{prog.have}/{prog.need}</span>}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {!isVip && (
                <div className="fa-set-note">
                    <InfoIcon />
                    <span>
                        Kino is exclusive to VIP members. <Link to="/customer/profile/membership">Upgrade your membership</Link> to
                        unlock your personal cinema companion.
                    </span>
                </div>
            )}
            {isVip && !isDesktop && (
                <div className="fa-set-note">
                    <InfoIcon />
                    <span>
                        You're on a compact screen. Kino lives on desktop (1024px and wider) — smaller screens keep the classic chat
                        button, so your preference is saved and activates automatically on a larger display.
                    </span>
                </div>
            )}
            {isVip && isDesktop && mode === "funny" && (
                <div className="fa-set-note" style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.22)", color: "#8fe0ab" }}>
                    <InfoIcon />
                    <span>Kino is live — look for the light in the bottom-right corner. Tap it any time to start chatting.</span>
                </div>
            )}
        </section>
    );
}
