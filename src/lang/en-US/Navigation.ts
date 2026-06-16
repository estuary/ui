import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';

export const Navigation: Record<string, string> = {
    'navigation.ariaLabel': `Main Navigation`,
    'navigation.ariaLabel.secondary': `Account and Help`,
    'navigation.tooltip.expand': `Expand Navigation`,
    'navigation.collapse': `Collapse`,

    'helpMenu.tooltip': `Help`,
    'helpMenu.docs': `Docs`,
    'helpMenu.docs.link': `https://docs.estuary.dev/`,
    'helpMenu.slack': `Estuary Slack`,
    'helpMenu.slack.link': `https://join.slack.com/t/estuary-dev/shared_invite/zt-86nal6yr-VPbv~YfZE9Q~6Zl~gmZdFQ`,
    'helpMenu.support': `Email Support`,
    'helpMenu.support.link': `${CommonMessages['support.email']}`,
    'helpMenu.contact': `${CTAs['cta.contactUs']}`,
    'helpMenu.contact.link': `https://estuary.dev/contact-us`,
    'helpMenu.status': `Status`,
    'helpMenu.status.link': `https://status.estuary.dev/`,

    'modeSwitch.label.light': `Light mode`,
    'modeSwitch.label.dark': `Dark mode`,

    'tenant.organization': `Organization`,

    'updateAlert.cta': `Update`,
    'updateAlert.title': `Dashboard Updated`,
    'updateAlert.message': `An updated version of the UI was released. Reload this page to get the latest changes.`,
    'updateAlert.warning': `Unsaved changes could be lost.`,
};
