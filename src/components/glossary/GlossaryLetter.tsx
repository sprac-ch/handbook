type GlossaryLetterProps = {
    letter: string;
    /** Available = has terms, Empty = no terms (cannot be picked), Active = the picked letter. */
    state: 'available' | 'empty' | 'active';
    onClick: () => void;
};

const STATES = {
    available: 'border border-line-subtle text-fg hover:border-line-strong hover:bg-overlay focus-visible:outline-accent',
    empty: 'text-fg-subtle',
    active: 'bg-accent text-on-accent focus-visible:outline-fg',
};

/** A to Z filter button: while it is active, only the terms that start with this letter are shown. */
export function GlossaryLetter({ letter, state, onClick }: GlossaryLetterProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={state === 'empty'}
            aria-pressed={state === 'active'}
            className={`flex size-9 shrink-0 items-center justify-center rounded-sm font-mono text-sm leading-[1.6] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${STATES[state]}`}
        >
            {letter}
        </button>
    );
}
