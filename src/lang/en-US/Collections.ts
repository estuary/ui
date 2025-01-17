import { CommonMessages } from './CommonMessages';
import { Details } from './Details';
import { RouteTitles } from './RouteTitles';

export const Collections: Record<string, string> = {
    'collectionsTable.title': `Collections`,
    'collectionsTable.cta.new': `New ${CommonMessages['terms.transformation']}`,
    'collectionsTable.detailsCTA': `Details`,
    'collectionsTable.filterLabel': `Filter collections`,
    'collectionsPreview.notFound.message': `We were unable to find any data which could mean the capture has not ingested data yet or is not running. Check the status on the {button} to make sure it is running.`,
    'collectionsPreview.notFound.message.button': `${RouteTitles['routeTitle.captures']} page`,
    'collectionsPreview.notFound.message.derivation': `We were unable to find any data which could mean the derivation has not ingested data yet or is not running. Check the status in the ${Details['detailsPanel.shardDetails.title']} section to make sure it is running.`,
};
