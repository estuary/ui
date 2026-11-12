import { Menu } from '@mui/material';

import ExternalLinkMenuItem from 'src/components/shared/ExternalLinkMenuItem';

interface HelpMenuProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

export function HelpMenu({ anchorEl, onClose }: HelpMenuProps) {
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
            <ExternalLinkMenuItem link="https://docs.estuary.dev/">
                Docs
            </ExternalLinkMenuItem>
            <ExternalLinkMenuItem link="https://status.estuary.dev/">
                Status
            </ExternalLinkMenuItem>
            <ExternalLinkMenuItem link="https://join.slack.com/t/estuary-dev/shared_invite/zt-86nal6yr-VPbv~YfZE9Q~6Zl~gmZdFQ">
                Estuary Slack
            </ExternalLinkMenuItem>
            <ExternalLinkMenuItem link="mailto:support@estuary.dev">
                Email Support
            </ExternalLinkMenuItem>
            <ExternalLinkMenuItem link="https://estuary.dev/contact-us">
                Contact Us
            </ExternalLinkMenuItem>
        </Menu>
    );
}
