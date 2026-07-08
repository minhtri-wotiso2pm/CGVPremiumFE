import { type FC } from "react";
import { WIZARD_STEPS } from "../../types/generateWizard.types";

const CheckIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

interface Props {
    currentStep: number;
}

const WizardStepper: FC<Props> = ({ currentStep }) => (
    <div className="stt-wizard-stepper">
        {WIZARD_STEPS.map((step, i) => {
            const isDone = step.key < currentStep;
            const isActive = step.key === currentStep;
            return (
                <div className="stt-wizard-stepper__item" key={step.key}>
                    <div className={`stt-wizard-stepper__node${isDone ? " stt-wizard-stepper__node--done" : ""}${isActive ? " stt-wizard-stepper__node--active" : ""}`}>
                        {isDone ? <CheckIcon /> : step.key}
                    </div>
                    <span className={`stt-wizard-stepper__label${isActive ? " stt-wizard-stepper__label--active" : ""}`}>
                        {step.label}
                    </span>
                    {i < WIZARD_STEPS.length - 1 && <span className="stt-wizard-stepper__sep" />}
                </div>
            );
        })}
    </div>
);

export default WizardStepper;
