import { CommonMessages } from './CommonMessages';

export const Collections: Record<string, string> = {
    'collectionsTable.title': `Collections`,
    'collectionsTable.cta.new': `New ${CommonMessages['terms.transformation']}`,
    'collectionsTable.detailsCTA': `Details`,
    'collectionsTable.filterLabel': `Filter collections`,
    'collections.message1': `You currently have no collections. Click the captures icon on the menu bar to get started.`,
    'collections.message2': `Captures connect to outside systems, pull in data, and generate {docLink} within Flow.`,
    'collections.message2.docLink': `collections`,
    'collections.message2.docPath': `https://docs.estuary.dev/concepts/collections/`,
    'collectionsPreview.notFound.message': `We were unable to find any data which could mean the capture has not ingested data yet or is not running. Check the status on the Captures page to make sure it is running.`,
};
