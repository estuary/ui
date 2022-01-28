import HelpIcon from '@mui/icons-material/Help';
import MenuItem from '@mui/material/MenuItem';
import ExternalLink from 'components/shared/ExternalLink';
import IconMenu from './IconMenu';

function HelpMenu() {
    return (
        <>
            <IconMenu
                ariaLabel="Open help"
                icon={<HelpIcon />}
                identifier="help-menu"
                tooltip="Help Links"
            >
                <>
                    <MenuItem>
                        <ExternalLink link="https://docs.estuary.dev/">
                            Flow Docs
                        </ExternalLink>
                    </MenuItem>
                    <MenuItem>
                        <ExternalLink link="https://join.slack.com/t/estuary-dev/shared_invite/zt-86nal6yr-VPbv~YfZE9Q~6Zl~gmZdFQ">
                            Estuary's Slack
                        </ExternalLink>
                    </MenuItem>
                    <MenuItem>
                        <ExternalLink link="https://www.estuary.dev/#get-in-touch">
                            Contact Us
                        </ExternalLink>
                    </MenuItem>
                </>
            </IconMenu>
        </>
    );
}

export default HelpMenu;
