import type { ReactNode } from 'react';

import { Link, Menu, MenuItem } from '@mui/material';

import { OpenNewWindow } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

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
                horizontal: 'left',
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

export default HelpMenu;
