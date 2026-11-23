export const REPO_URL = 'https://github.com/sprac-ch/handbook/';

/** Contact address of the project: llms.txt, security.txt and the JSON-LD. The legal pages write it in their Markdown files. */
export const CONTACT_EMAIL = 'contact@spr4c.ch';

/** GitHub page of a file of this repository on the dev branch, for example `content/sparc.md`. */
export const fileUrl = (file: string) => `${REPO_URL}blob/dev/${file}`;
