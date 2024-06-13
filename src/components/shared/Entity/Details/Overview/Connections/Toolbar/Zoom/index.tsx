import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import IconMenu from 'components/menus/IconMenu';
import { disabledButtonText_primary } from 'context/Theme';
import { ZoomIn } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';
import FreeformZoomOption from './FreeformZoomOption';
import ManualZoom from './ManualZoom';

interface Props {
    onFreeformZoomChange: (
        event: React.SyntheticEvent<Element, Event>,
        checked: boolean
    ) => void;
    onManualZoom: (
        event: React.SyntheticEvent<Element, Event>,
        value: number
    ) => void;
    disabled?: boolean;
}

function ZoomSettings({ onFreeformZoomChange, onManualZoom, disabled }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <IconMenu
            ariaLabel={intl.formatMessage({
                id: 'details.scopedSystemGraph.toolbar.zoom.ariaLabel',
            })}
            disableCloseOnClick
            disabled={disabled}
            icon={
                <ZoomIn
                    style={{
                        color: disabled
                            ? disabledButtonText_primary[theme.palette.mode]
                            : theme.palette.primary.main,
                    }}
                />
            }
            identifier="zoom-settings-menu"
            tooltip={intl.formatMessage({
                id: 'details.scopedSystemGraph.toolbar.zoom.header',
            })}
        >
            <Typography
                component={Box}
                sx={{ minWidth: 'max-content', px: 2, pb: 2, fontWeight: 500 }}
            >
                <FormattedMessage id="details.scopedSystemGraph.toolbar.zoom.header" />
            </Typography>

            <Stack spacing={1} sx={{ px: 2 }}>
                <ManualZoom disabled={disabled} onManualZoom={onManualZoom} />

                <Divider />

                <FreeformZoomOption
                    disabled={disabled}
                    onFreeformZoomChange={onFreeformZoomChange}
                />
            </Stack>
        </IconMenu>
    );
}

export default ZoomSettings;
