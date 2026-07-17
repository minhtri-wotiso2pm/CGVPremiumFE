import { Fragment, type FC } from "react";
import type { CounterStep } from "../../types/counter.types";
import { CheckIcon } from "./icons";
import styles from "./counter.module.css";

const STEP_LABEL: Record<CounterStep, string> = {
    mode: "Mode",
    showtime: "Showtime",
    seats: "Seats",
    fnb: "F&B",
    customer: "Customer",
    payment: "Payment",
};

interface Props {
    steps: CounterStep[];
    current: CounterStep;
    isStepComplete: (step: CounterStep) => boolean;
    canAccessStep: (step: CounterStep) => boolean;
    onStepClick: (step: CounterStep) => void;
}

const CounterStepper: FC<Props> = ({ steps, current, isStepComplete, canAccessStep, onStepClick }) => {
    const currentIdx = steps.indexOf(current);
    return (
    <div className={styles.stepper} role="tablist" aria-label="Counter booking steps">
        {steps.map((step, i) => {
            const isActive = step === current;
            // "Done" = a step we've already moved past (and that's satisfied) —
            // never a future step, even if it's optional/technically complete.
            const done = i < currentIdx && isStepComplete(step);
            const accessible = canAccessStep(step) && !isActive;
            return (
                <Fragment key={step}>
                    {i > 0 && <span className={styles.stepSep} />}
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        disabled={!accessible && !isActive}
                        className={[
                            styles.stepBtn,
                            isActive ? styles.stepBtnActive : "",
                            done ? styles.stepDone : "",
                            accessible ? styles.stepBtnAccessible : "",
                        ].filter(Boolean).join(" ")}
                        onClick={() => accessible && onStepClick(step)}
                    >
                        <span className={styles.stepIndex}>
                            {done ? <CheckIcon size={13} /> : i + 1}
                        </span>
                        {STEP_LABEL[step]}
                    </button>
                </Fragment>
            );
        })}
    </div>
    );
};

export default CounterStepper;
