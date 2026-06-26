import { Menu } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import ExternalLinkMenuItem from 'src/components/shared/ExternalLinkMenuItem';

interface HelpMenuProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

export function HelpMenu({ anchorEl, onClose }: HelpMenuProps) {
    const intl = useIntl();

    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onClose}
            onClick={onClose}
            anchorOrigin={{
                horizontal: 'right',
                vertical: 'top',
            }}
            transformOrigin={{
                horizontal: 'left',
                vertical: 'bottom',
            }}
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
        </Menu>
    );
}
