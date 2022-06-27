import HelpIcon from '@mui/icons-material/Help';
import { SxProps, Theme } from '@mui/material';
import ExternalLinkMenuItem from 'components/shared/ExternalLinkMenuItem';
import { FormattedMessage, useIntl } from 'react-intl';
import IconMenu from './IconMenu';

interface Props {
    iconSx: SxProps<Theme>;
}

function HelpMenu({ iconSx }: Props) {
    const intl = useIntl();

    return (
        <IconMenu
            ariaLabel={intl.formatMessage({ id: 'helpMenu.ariaLabel' })}
            icon={<HelpIcon sx={iconSx} />}
            identifier="help-menu"
            tooltip={intl.formatMessage({ id: 'helpMenu.tooltip' })}
        >
            <ExternalLinkMenuItem
                link={intl.formatMessage({ id: 'helpMenu.docs.link' })}
            >
                <FormattedMessage id="helpMenu.docs" />
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
