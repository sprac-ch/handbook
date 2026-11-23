import { programCard, type ProgramCardContent } from './home';
import { paragraphs } from './markdown';
import { at } from './read';
import { readDoc } from './source';

const FILE = 'our-pages';

export type OurPages = { title: string; lead: string; sites: ProgramCardContent[] };

function readOurPages(): OurPages {
    const page = at(readDoc(FILE).root.sections, 0, FILE, 'the page title (# heading)');
    const sites = at(page.sections, 0, FILE, 'the "Sites" section (## heading)');

    at(sites.sections, 0, FILE, 'a site card (### heading)');

    return {
        title: page.title,
        lead: at(paragraphs(page), 0, FILE, 'the intro paragraph'),
        sites: sites.sections.map((card) => programCard(card, FILE)),
    };
}

let ourPages: OurPages | undefined;

/** Content of content/our-pages.md. */
export function getOurPages(): OurPages {
    return (ourPages ??= readOurPages());
}
