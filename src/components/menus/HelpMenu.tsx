import HelpIcon from '@mui/icons-material/Help';
import ExternalLinkMenuItem from 'components/shared/ExternalLinkMenuItem';
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
                <ExternalLinkMenuItem link="https://docs.estuary.dev/">
                    Flow Docs
                </ExternalLinkMenuItem>
                <ExternalLinkMenuItem link="https://join.slack.com/t/estuary-dev/shared_invite/zt-86nal6yr-VPbv~YfZE9Q~6Zl~gmZdFQ">
                    Estuary's Slack
                </ExternalLinkMenuItem>
                <ExternalLinkMenuItem link="https://www.estuary.dev/#get-in-touch">
                    Contact Us
                </ExternalLinkMenuItem>
            </IconMenu>
        </>
    );
}

export default HelpMenu;
