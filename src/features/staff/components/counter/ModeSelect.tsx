import type { FC } from "react";
import type { CounterMode } from "../../types/counter.types";
import { TicketFnbIcon, FnbOnlyIcon } from "./icons";
import styles from "./counter.module.css";

interface Props {
    onSelect: (mode: CounterMode) => void;
}

const ModeSelect: FC<Props> = ({ onSelect }) => (
    <div className={styles.modeWrap}>
        <button type="button" className={styles.modeCard} onClick={() => onSelect("TICKET_FNB")}>
            <span className={styles.modeIcon}><TicketFnbIcon size={28} /></span>
            <h3 className={styles.modeTitle}>Tickets + F&amp;B</h3>
            <p className={styles.modeDesc}>
                Pick a showtime and seats, then add food &amp; drinks. For customers buying movie tickets at the counter.
            </p>
        </button>

        <button type="button" className={styles.modeCard} onClick={() => onSelect("FNB_ONLY")}>
            <span className={styles.modeIcon}><FnbOnlyIcon size={28} /></span>
            <h3 className={styles.modeTitle}>F&amp;B only</h3>
            <p className={styles.modeDesc}>
                Skip straight to food &amp; drinks — no showtime or seats. For customers who only want concessions.
            </p>
        </button>
    </div>
);

export default ModeSelect;
