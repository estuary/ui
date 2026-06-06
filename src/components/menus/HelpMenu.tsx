import type { ReactNode } from 'react';

import { Link, MenuItem } from '@mui/material';

import { HelpCircle, OpenNewWindow } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

import IconMenu from 'src/components/menus/IconMenu';

const ExternalLinkMenuItem = ({
    children,
    link,
}: {
    children: ReactNode;
    link: string;
}) => (
    <MenuItem
        component={Link}
        href={link}
        target="_blank"
        rel="noopener"
        tabIndex={0}
        sx={{
            bgcolor: 'none',
            color: 'text.primary',
            fontSize: 14,
            fontWeight: 500,
            gap: 1,
            px: 3,
            py: 1.5,
        }}
    >
        <span>{children}</span>

        <OpenNewWindow style={{ fontSize: '0.75em' }} />
    </MenuItem>
);

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
