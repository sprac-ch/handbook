/** A to Z jump link. Available = has terms, Empty = no terms, Active = the letter group currently in view. */
export function GlossaryLetter({ letter, state }: { letter: string; state: 'available' | 'empty' | 'active' }) {
    const box = 'flex size-9 shrink-0 items-center justify-center rounded-sm font-mono text-sm leading-[1.6]';

    if (state === 'empty') {
        return (
            <span className={`${box} text-fg-subtle`} aria-disabled="true">
                {letter}
            </span>
        );
    }

    return (
        <a
            href={`#letter-${letter.toLowerCase()}`}
            aria-current={state === 'active' ? 'location' : undefined}
            className={`${box} transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                state === 'active' ? 'bg-accent text-on-accent focus-visible:outline-fg' : 'border border-line-subtle text-fg hover:border-line-strong hover:bg-overlay focus-visible:outline-accent'
            }`}
        >
            {letter}
        </a>
    );
}
