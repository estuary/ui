import { HelpCircle } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

import IconMenu from 'src/components/menus/IconMenu';
import ExternalLinkMenuItem from 'src/components/shared/ExternalLinkMenuItem';

function HelpMenu() {
    const intl = useIntl();

    return (
        <IconMenu
            ariaLabel={intl.formatMessage({ id: 'helpMenu.ariaLabel' })}
            icon={<HelpCircle />}
            identifier="help-menu"
            tooltip={intl.formatMessage({ id: 'helpMenu.tooltip' })}
        >
            <ExternalLinkMenuItem
                link={intl.formatMessage({ id: 'helpMenu.docs.link' })}
            >
                <FormattedMessage id="helpMenu.docs" />
            </ExternalLinkMenuItem>
            <ExternalLinkMenuItem
                link={intl.formatMessage({ id: 'helpMenu.status.link' })}
            >
                <FormattedMessage id="helpMenu.status" />
            </ExternalLinkMenuItem>
            <ExternalLinkMenuItem
                link={intl.formatMessage({ id: 'helpMenu.slack.link' })}
            >
                <FormattedMessage id="helpMenu.slack" />
            </ExternalLinkMenuItem>
            <ExternalLinkMenuItem
                link={intl.formatMessage({ id: 'helpMenu.support.link' })}
            >
                <FormattedMessage id="helpMenu.support" />
            </ExternalLinkMenuItem>
            <ExternalLinkMenuItem
                link={intl.formatMessage({ id: 'helpMenu.contact.link' })}
            >
                <FormattedMessage id="helpMenu.contact" />
            </ExternalLinkMenuItem>
        </IconMenu>
    );
}

export default HelpMenu;
