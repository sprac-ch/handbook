import { useEffect, useMemo, useState } from 'react';
import { Inline } from '@/components/content/Inline';
import { GlossaryEntry } from '@/components/glossary/GlossaryEntry';
import { GlossaryLetter } from '@/components/glossary/GlossaryLetter';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { fileUrl } from '@/config/links';
import { ALPHABET, getGlossary, type GlossaryGroup } from '@/content/glossary';
import { getSite } from '@/content/site';

/** A group counts as "in view" once its heading has scrolled up to just under the sticky navbar. */
const SPY_OFFSET = 120;

function filterGroups(groups: GlossaryGroup[], query: string): GlossaryGroup[] {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;
    return groups
        .map((group) => ({ ...group, terms: group.terms.filter((entry) => [entry.term, entry.fullName ?? '', entry.definition].some((text) => text.toLowerCase().includes(needle))) }))
        .filter((group) => group.terms.length > 0);
}

/** The letter of the last group whose heading has passed the top of the screen. */
function useActiveLetter(letters: string[]): string | undefined {
    const [active, setActive] = useState(letters[0]);

    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            const passed = letters.filter((letter) => {
                const top = document.getElementById(`letter-${letter.toLowerCase()}`)?.getBoundingClientRect().top;
                return top !== undefined && top <= SPY_OFFSET;
            });
            setActive(passed.at(-1) ?? letters[0]);
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [letters]);

    return letters.includes(active ?? '') ? active : letters[0];
}

/** Glossary: search, A to Z index and every abbreviation explained once. Desktop 1440, iPad 834, iPhone 393. Content: content/glossary.md. */
export function Glossary() {
    const { labels } = getSite();
    const { title, lead, search, indexLabel, groups } = getGlossary();
    const [query, setQuery] = useState('');

    const visible = useMemo(() => filterGroups(groups, query), [groups, query]);
    const letters = useMemo(() => visible.map((group) => group.letter), [visible]);
    const active = useActiveLetter(letters);

    return (
        <PageLayout>
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 pt-4 pb-16 md:gap-12 md:px-8 md:pt-6 md:pb-24 lg:gap-16 lg:px-20 lg:pt-8 lg:pb-32">
                <div className="flex justify-end">
                    {/* Opens this page's Markdown file on the dev branch: the starting point for a change. */}
                    <Button href={fileUrl('content/glossary.md')} variant="secondary" size="s" icon="pencil-simple">
                        {labels.editPage}
                    </Button>
                </div>

                <header className="flex flex-col gap-6 break-words">
                    <h1 className="font-display text-[36px] leading-[1.1] font-bold tracking-[-0.025em] md:text-[44px] lg:text-[56px]">{title}</h1>
                    <p className="text-base leading-[1.6] text-fg-muted md:text-lg">
                        <Inline text={lead} />
                    </p>
                </header>

                <div className="flex flex-col gap-5">
                    <Input
                        type="search"
                        label={search.label}
                        placeholder={search.placeholder}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        className="w-full lg:w-[480px]"
                    />
                    <nav aria-label={indexLabel}>
                        <ul className="flex flex-wrap gap-2">
                            {ALPHABET.map((letter) => (
                                <li key={letter}>
                                    <GlossaryLetter letter={letter} state={letter === active ? 'active' : letters.includes(letter) ? 'available' : 'empty'} />
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="flex w-full flex-col gap-10 md:gap-12 lg:max-w-[960px] lg:gap-14">
                    {visible.map((group) => (
                        <section key={group.letter} aria-labelledby={`letter-${group.letter.toLowerCase()}`} className="flex flex-col gap-2 md:flex-row md:items-start md:gap-10">
                            <h2
                                id={`letter-${group.letter.toLowerCase()}`}
                                className="scroll-mt-24 font-display text-[28px] leading-[1.15] font-bold tracking-[-0.02em] text-accent md:w-16 md:shrink-0 md:text-[34px] lg:w-24 lg:text-[40px]"
                            >
                                {group.letter}
                            </h2>
                            <dl className="flex min-w-0 flex-1 flex-col">
                                {group.terms.map((entry) => (
                                    <GlossaryEntry key={entry.id} entry={entry} />
                                ))}
                            </dl>
                        </section>
                    ))}
                    {visible.length === 0 && (
                        <p role="status" className="text-base leading-[1.6] text-fg-muted">
                            {search.empty}
                        </p>
                    )}
                </div>
            </div>
        </PageLayout>
    );
}
