import { type FC, useState } from "react";
import { createPortal } from "react-dom";
import { INITIAL_WIZARD_STATE, type GenerateWizardState } from "../../types/generateWizard.types";
import WizardStepper from "./WizardStepper";
import StepMovieSelect from "./StepMovieSelect";
import StepRoomSelect from "./StepRoomSelect";
import StepTypeAndLocalPreview from "./StepTypeAndLocalPreview";
import StepDateRangeAndServerPreview from "./StepDateRangeAndServerPreview";
import StepGenerateSummary from "./StepGenerateSummary";

interface Props {
    open: boolean;
    onClose: () => void;
    cinemaId: number;
    initialShowtimeTypeId?: number | null;
}

interface InnerProps {
    cinemaId: number;
    initialShowtimeTypeId?: number | null;
    onClose: () => void;
}

const canAdvance = (step: number, s: GenerateWizardState): boolean => {
    switch (step) {
        case 1: return s.movieId != null;
        case 2: return s.roomId != null;
        case 3: return s.showtimeTypeId != null && s.basePrice != null && s.basePrice > 0;
        case 4: return s.dateRange != null;
        default: return true;
    }
};

const GenerateShowtimeWizardInner: FC<InnerProps> = ({ cinemaId, initialShowtimeTypeId, onClose }) => {
    const [step, setStep] = useState(1);
    const [state, setState] = useState<GenerateWizardState>({
        ...INITIAL_WIZARD_STATE,
        showtimeTypeId: initialShowtimeTypeId ?? null,
    });
    const [previewValidated, setPreviewValidated] = useState(false);

    const patch = (fields: Partial<GenerateWizardState>) => {
        setState((prev) => ({ ...prev, ...fields }));
    };

    const goNext = () => setStep((s) => Math.min(5, s + 1));
    const goBack = () => setStep((s) => Math.max(1, s - 1));

    return createPortal(
        <div className="stt-modal-overlay" onClick={onClose}>
            <div className="stt-wizard" onClick={(e) => e.stopPropagation()}>
                <div className="stt-wizard__header">
                    <h2 className="stt-modal__title">Generate Showtimes from Type</h2>
                    <button className="stt-modal__close" onClick={onClose} aria-label="Close">×</button>
                </div>

                <WizardStepper currentStep={step} />

                <div className="stt-wizard__body">
                    {step === 1 && (
                        <StepMovieSelect
                            movieId={state.movieId}
                            onSelect={(movieId) => { patch({ movieId }); goNext(); }}
                        />
                    )}
                    {step === 2 && (
                        <StepRoomSelect
                            cinemaId={cinemaId}
                            roomId={state.roomId}
                            onSelect={(roomId) => { patch({ roomId }); goNext(); }}
                        />
                    )}
                    {step === 3 && (
                        <StepTypeAndLocalPreview
                            cinemaId={cinemaId}
                            movieId={state.movieId}
                            showtimeTypeId={state.showtimeTypeId}
                            basePrice={state.basePrice}
                            onSelectType={(showtimeTypeId) => patch({ showtimeTypeId })}
                            onBasePriceChange={(basePrice) => patch({ basePrice })}
                        />
                    )}
                    {step === 4 && (
                        <StepDateRangeAndServerPreview
                            state={state}
                            onDateRangeChange={(dateRange) => { patch({ dateRange }); setPreviewValidated(false); }}
                            onPreviewComplete={() => setPreviewValidated(true)}
                        />
                    )}
                    {step === 5 && (
                        <StepGenerateSummary state={state} onGenerated={onClose} />
                    )}
                </div>

                <div className="stt-wizard__footer">
                    <button className="stt-btn stt-btn--ghost" onClick={step === 1 ? onClose : goBack}>
                        {step === 1 ? "Cancel" : "Back"}
                    </button>
                    {step === 1 || step === 2 ? (
                        <span className="stt-wizard__hint">Click an option to continue</span>
                    ) : step < 5 ? (
                        <button
                            className="stt-btn stt-btn--primary"
                            onClick={goNext}
                            disabled={!canAdvance(step, state) || (step === 4 && !previewValidated)}
                        >
                            Next
                        </button>
                    ) : null}
                </div>
            </div>
        </div>,
        document.body,
    );
};

const GenerateShowtimeWizard: FC<Props> = ({ open, onClose, cinemaId, initialShowtimeTypeId }) => {
    if (!open) return null;
    return (
        <GenerateShowtimeWizardInner
            cinemaId={cinemaId}
            initialShowtimeTypeId={initialShowtimeTypeId}
            onClose={onClose}
        />
    );
};

export default GenerateShowtimeWizard;
