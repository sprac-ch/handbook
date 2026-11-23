import { Inline } from '@/components/content/Inline';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { ProgramCard } from '@/components/ui/ProgramCard';
import { fileUrl } from '@/config/links';
import { getOurPages } from '@/content/ourPages';
import { getSite } from '@/content/site';

/** Our pages: one card per site the community runs under spr4c.ch. Content: content/our-pages.md. */
export function OurPages() {
    const { labels } = getSite();
    const { title, lead, sites } = getOurPages();

    return (
        <PageLayout>
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 pt-4 pb-16 md:gap-12 md:px-8 md:pt-6 md:pb-24 lg:gap-16 lg:px-20 lg:pt-8 lg:pb-32">
                <div className="flex justify-end">
                    {/* Opens this page's Markdown file on the dev branch: the starting point for a change. */}
                    <Button href={fileUrl('content/our-pages.md')} variant="secondary" size="s" icon="pencil-simple">
                        {labels.editPage}
                    </Button>
                </div>

                <header className="flex flex-col gap-6 break-words">
                    <h1 className="font-display text-[36px] leading-[1.1] font-bold tracking-[-0.025em] md:text-[44px] lg:text-[56px]">{title}</h1>
                    <p className="text-base leading-[1.6] text-fg-muted md:text-lg">
                        <Inline text={lead} />
                    </p>
                </header>

                <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
                    {sites.map((site) => (
                        <ProgramCard key={site.name} {...site} />
                    ))}
                </div>
            </div>
        </PageLayout>
    );
}
