import { Inline } from '@/components/content/Inline';
import type { GlossaryTerm } from '@/content/glossary';

/** Glossary term: a row on tablet and desktop, stacked on phones. The full name is only shown for abbreviations. */
export function GlossaryEntry({ entry }: { entry: GlossaryTerm }) {
    return (
        <div id={entry.id} className="flex scroll-mt-24 flex-col gap-1.5 border-b border-line-subtle py-5 break-words md:flex-row md:gap-8">
            <dt className="font-display text-xl leading-[1.4] font-medium tracking-[-0.005em] text-fg md:w-[180px] md:shrink-0">{entry.term}</dt>
            <dd className="flex min-w-0 flex-1 flex-col gap-1">
                {entry.fullName && <span className="text-sm leading-[1.2] font-medium text-accent">{entry.fullName}</span>}
                <span className="text-base leading-[1.6] text-fg-muted">
                    <Inline text={entry.definition} />
                </span>
            </dd>
        </div>
    );
}
