import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';

export const Navigation: Record<string, string> = {
    'helpMenu.docs': `Docs`,
    'helpMenu.docs.link': `https://docs.estuary.dev/`,
    'helpMenu.slack': `Estuary Slack`,
    'helpMenu.slack.link': `https://join.slack.com/t/estuary-dev/shared_invite/zt-86nal6yr-VPbv~YfZE9Q~6Zl~gmZdFQ`,
    'helpMenu.support': `Email Support`,
    'helpMenu.support.link': `${CommonMessages['support.email']}`,
    'helpMenu.contact': `${CTAs['cta.contactUs']}`,
    'helpMenu.contact.link': `https://estuary.dev/contact-us`,
    'helpMenu.about': `About ${CommonMessages.productName}`,
    'helpMenu.status': `Status`,
    'helpMenu.status.link': `https://status.estuary.dev/`,

    'updateAlert.cta': `Update`,
    'updateAlert.title': `Dashboard Updated`,
    'updateAlert.message': `An updated version of the UI was released. Reload this page to get the latest changes.`,
    'updateAlert.warning': `Unsaved changes could be lost.`,
};
