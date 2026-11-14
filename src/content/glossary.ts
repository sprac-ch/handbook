import { keyValue, lists, paragraphs, slugify, tables } from './markdown';
import { at, ContentError } from './read';
import { readDoc } from './source';

const FILE = 'glossary';

export type GlossaryTerm = { id: string; term: string; fullName?: string; definition: string };
export type GlossaryGroup = { letter: string; terms: GlossaryTerm[] };

export type GlossaryPage = {
    title: string;
    lead: string;
    search: { label: string; placeholder: string; empty: string };
    indexLabel: string;
    groups: GlossaryGroup[];
};

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** "Ärztlicher Dienst" -> "A": the group a term belongs to. */
function letterOf(term: string): string {
    const letter = term.normalize('NFD').charAt(0).toUpperCase();
    if (!ALPHABET.includes(letter)) throw new ContentError(FILE, `the term "${term}" must start with a letter from A to Z`);
    return letter;
}

function readGlossary(): GlossaryPage {
    const page = at(readDoc(FILE).root.sections, 0, FILE, 'the page title (# heading)');
    const labels = at(lists(page), 0, FILE, 'the list of labels (search, no results, index)');
    const [label, placeholder] = keyValue(at(labels, 0, FILE, 'the search line ("Search: placeholder")'));
    const terms = at(page.sections, 0, FILE, 'the "Terms" section (## heading)');

    const rows = at(tables(terms), 0, FILE, 'the table of terms').rows.map(([term = '', fullName = '', definition = '']): GlossaryTerm => {
        if (!term || !definition) throw new ContentError(FILE, `every row of the table needs a term and a definition (row "${term || definition}")`);
        return { id: slugify(term), term, fullName: fullName || undefined, definition };
    });

    // Groups follow the alphabet; inside a group the terms keep the order of the table.
    const groups = ALPHABET.map((letter) => ({ letter, terms: rows.filter((row) => letterOf(row.term) === letter) })).filter((group) => group.terms.length > 0);

    return {
        title: page.title,
        lead: at(paragraphs(page), 0, FILE, 'the intro paragraph'),
        search: { label, placeholder, empty: keyValue(at(labels, 1, FILE, 'the "No results: ..." line'))[1] },
        indexLabel: keyValue(at(labels, 2, FILE, 'the "Index: ..." line'))[1],
        groups,
    };
}

let glossary: GlossaryPage | undefined;

/** Content of content/glossary.md. */
export function getGlossary(): GlossaryPage {
    return (glossary ??= readGlossary());
}
