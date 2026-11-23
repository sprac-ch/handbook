// Kept free of path aliases and browser APIs: vite.config.ts imports it at build time.
import { CONTACT_EMAIL, REPO_URL } from '../config/links.ts';
import { parseMarkdown, plainText, tables, type Section } from '../content/markdown.ts';
import type { SiteMeta } from '../content/siteMeta.ts';
import { PAGES, contentName, pagePath, type Page } from '../router/pages.ts';

/*
 * Public address of the site, including the subpath. vite.config.ts sets it through `define` in the bundles, and on globalThis.
 */
declare const __SITE_URL__: string;

const siteUrl = () => __SITE_URL__;

const OG_IMAGE = { path: '/assets/social/og-image.png', width: 1200, height: 630 };
const LOGO_PATH = '/assets/logos/sparc-community-patch-512.png';
/** The community's own git instance, next to the GitHub repository. */
const FORGEJO_URL = 'https://git.spr4c.ch/sprac-community';

/** Robots meta for every indexable page: allow large image previews and full-length snippets in search and AI answers. */
export const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1';

/** Reads the text of `content/<name>.md`. */
export type ReadContent = (name: string) => string;

/** JSON-LD nodes that only some pages have, built from their content file. */
export type GraphNode = Record<string, unknown>;

export type PageMeta = {
    page: Page;
    title: string;
    description: string;
    url: string;
};

export function pageUrl(page: Page): string {
    return `${siteUrl()}${pagePath(page)}`;
}

/** Title, description and address of a page, from the front matter of its content file. */
export function getPageMeta(site: SiteMeta, page: Page): PageMeta {
    const { title, description } = site.pages[page];

    return {
        page,
        title: page === 'home' ? title : `${title} · ${site.siteName}`,
        description,
        url: pageUrl(page),
    };
}

function escape(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** schema.org graph: the site, the community behind it, and this page. */
function structuredData(site: SiteMeta, meta: PageMeta, extra: GraphNode[]): string {
    const SITE_URL = siteUrl();
    const graph = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': `${SITE_URL}/#organization`,
                name: 'SPARC Community',
                url: SITE_URL,
                logo: `${SITE_URL}${LOGO_PATH}`,
                email: CONTACT_EMAIL,
                contactPoint: { '@type': 'ContactPoint', email: CONTACT_EMAIL, contactType: 'customer support', availableLanguage: 'en' },
                sameAs: [REPO_URL, FORGEJO_URL],
            },
            {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                name: site.siteName,
                url: SITE_URL,
                inLanguage: 'en',
                publisher: { '@id': `${SITE_URL}/#organization` },
            },
            {
                '@type': 'WebPage',
                '@id': `${meta.url}#webpage`,
                url: meta.url,
                name: meta.title,
                description: meta.description,
                inLanguage: 'en',
                isPartOf: { '@id': `${SITE_URL}/#website` },
                ...(meta.page !== 'home' && { breadcrumb: { '@id': `${meta.url}#breadcrumb` } }),
            },
            ...(meta.page !== 'home' ? [breadcrumb(site, meta)] : []),
            ...extra,
        ],
    };
    // "<" would let the JSON close the script tag early.
    return JSON.stringify(graph).replace(/</g, '\\u003c');
}

/** Home > page, for the breadcrumb trail search engines show instead of the bare URL. */
function breadcrumb(site: SiteMeta, meta: PageMeta): GraphNode {
    return {
        '@type': 'BreadcrumbList',
        '@id': `${meta.url}#breadcrumb`,
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: site.pages.home.title, item: pageUrl('home') },
            { '@type': 'ListItem', position: 2, name: site.pages[meta.page].title, item: meta.url },
        ],
    };
}

/** The glossary as a DefinedTermSet: every term with its full name and definition, so answer engines can quote it. */
function glossaryTerms(read: ReadContent): GraphNode[] {
    const doc = parseMarkdown(read(contentName('glossary')));
    const rows = doc.root.sections[0]?.sections[0] ? (tables(doc.root.sections[0].sections[0])[0]?.rows ?? []) : [];
    const url = pageUrl('glossary');
    const slug = (term: string) => term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    return [
        {
            '@type': 'DefinedTermSet',
            '@id': `${url}#terms`,
            name: doc.meta.title,
            url,
            inLanguage: 'en',
            hasDefinedTerm: rows.map(([term, fullName, definition]) => ({
                '@type': 'DefinedTerm',
                '@id': `${url}#${slug(term)}`,
                name: term,
                ...(fullName && { alternateName: fullName }),
                description: plainText(definition),
                url: `${url}#${slug(term)}`,
                inDefinedTermSet: { '@id': `${url}#terms` },
            })),
        },
    ];
}

/** Extra JSON-LD for a page, read from its content file. */
export function pageGraph(page: Page, read: ReadContent): GraphNode[] {
    return page === 'glossary' ? glossaryTerms(read) : [];
}

/** Everything that differs per page inside <head>. */
export function renderHeadTags(site: SiteMeta, meta: PageMeta, extra: GraphNode[] = []): string {
    const tags = [
        `<title>${escape(meta.title)}</title>`,
        `<meta name="description" content="${escape(meta.description)}" />`,
        `<meta name="robots" content="${ROBOTS_INDEX}" />`,
        `<link rel="canonical" href="${meta.url}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="${escape(site.siteName)}" />`,
        `<meta property="og:title" content="${escape(meta.title)}" />`,
        `<meta property="og:description" content="${escape(meta.description)}" />`,
        `<meta property="og:url" content="${meta.url}" />`,
        `<meta property="og:image" content="${siteUrl()}${OG_IMAGE.path}" />`,
        `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
        `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
        `<meta property="og:image:alt" content="SPARC Community patch" />`,
        `<meta property="og:locale" content="en_GB" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<script type="application/ld+json">${structuredData(site, meta, extra)}</script>`,
    ];
    return tags.join('\n        ');
}

/** sitemap.xml with every page and the day its content file last changed. */
export function renderSitemap(lastmod: (page: Page) => string): string {
    const urls = PAGES.map((page) => `    <url>\n        <loc>${pageUrl(page)}</loc>\n        <lastmod>${lastmod(page)}</lastmod>\n    </url>`);

    return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls, '</urlset>', ''].join('\n');
}

/** robots.txt: every page is public, search and AI crawlers are welcome. */
export function renderRobots(): string {
    const lines = [
        '# Every page is public; search and AI crawlers are welcome.',
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: ${siteUrl()}/sitemap.xml`,
        '',
        '# A short guide for language models: llms.txt. The whole site as Markdown: llms-full.txt.',
        '',
    ];
    return lines.join('\n');
}

/** The links of a `###` group in the footer of site.md ("Official sites"). */
function footerLinks(read: ReadContent, group: string): string[] {
    const footer = parseMarkdown(read('site')).root.sections.find((section) => section.title === 'Footer');
    const part = footer?.sections.find((section: Section) => section.title === group);
    const list = part?.blocks.find((block) => block.kind === 'list');
    return list?.kind === 'list' ? list.items : [];
}

/** Content of a page file as plain Markdown for language models: no front matter, comments or icons, absolute links. */
function markdownFor(page: Page, read: ReadContent): string {
    const url = pageUrl(page);
    return read(contentName(page))
        .replace(/^---[\s\S]*?\n---\n/, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s*!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)\]\(#\)/g, '$1')
        .replace(/\]\(#([^)]+)\)/g, `](${url}#$1)`)
        .replace(/\]\(\/([^)]*)\)/g, `](${siteUrl()}/$1)`)
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/** llms.txt (llmstxt.org): what the site is, every page with its description, and where to read more. */
export function renderLlms(site: SiteMeta, read: ReadContent): string {
    const pages = PAGES.map((page) => `- [${site.pages[page].title}](${pageUrl(page)}): ${site.pages[page].description}`);
    const official = footerLinks(read, 'Official sites').map((item) => `- ${item}`);

    return [
        `# ${site.siteName}`,
        '',
        `> ${site.pages.home.description}`,
        '',
        'Made by students from the SPARC community. Not affiliated with SPARC, the Swiss Armed Forces or the Kommando Cyber. Always confirm your own situation with the official sources below.',
        '',
        '## Pages',
        '',
        ...pages,
        '',
        '## Official sources',
        '',
        ...official,
        '',
        '## Optional',
        '',
        `- [Full content](${siteUrl()}/llms-full.txt): every page of the site as Markdown`,
        `- [Sitemap](${siteUrl()}/sitemap.xml)`,
        `- [Source code](${REPO_URL})`,
        `- [Security contact](${siteUrl()}/.well-known/security.txt)`,
        `- Contact: ${CONTACT_EMAIL}`,
        '',
    ].join('\n');
}

/** llms-full.txt: every page as Markdown, one after the other, each with its address. */
export function renderLlmsFull(site: SiteMeta, read: ReadContent): string {
    const pages = PAGES.map((page) => [`<!-- ${pageUrl(page)} -->`, markdownFor(page, read)].join('\n\n'));
    return [`# ${site.siteName}`, '', `> ${site.pages.home.description}`, '', ...pages.flatMap((text) => ['---', '', text, ''])].join('\n');
}

/** .well-known/security.txt (RFC 9116). Expires 11 months after the build (the RFC asks for less than a year), so every deploy renews it. */
export function renderSecurityTxt(built: Date): string {
    const expires = new Date(built);
    expires.setUTCMonth(expires.getUTCMonth() + 11);

    return [
        `# Security contact for ${new URL(siteUrl()).host} (RFC 9116).`,
        '# Please report vulnerabilities privately to the address below, not in a public issue.',
        '#',
        '# Are you just visiting for fun and you are not part of SPARC? Join the program (and the community!): https://sparc-cyberdefence.ch/us/',
        `Contact: mailto:${CONTACT_EMAIL}`,
        `Expires: ${expires.toISOString()}`,
        'Preferred-Languages: en',
        `Canonical: ${siteUrl()}/.well-known/security.txt`,
        '',
    ].join('\n');
}
