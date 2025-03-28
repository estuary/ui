import { ReactNode } from 'react';

import { Box, IconButton, Popover } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { DEFAULT_ANCHOR_ORIGIN, DEFAULT_TRANSFORM_ORIGIN } from './shared';
import { PickerProps } from './types';
import { bindFocus, bindPopover } from 'material-ui-popup-state/hooks';
import { useIntl } from 'react-intl';

import { BaseComponentProps } from 'src/types';

interface Props extends PickerProps, BaseComponentProps {
    icon: ReactNode;
    iconAriaId: string;
}

function DateOrTimePickerWrapper({
    children,
    enabled,
    label,
    buttonRef,
    state,
    icon,
    iconAriaId,
}: Props) {
    const intl = useIntl();

    return (
        <>
            <Box sx={{ paddingTop: 2 }}>
                <IconButton
                    aria-label={intl.formatMessage(
                        {
                            id: iconAriaId,
                        },
                        {
                            label,
                        }
                    )}
                    disabled={!enabled}
                    ref={buttonRef}
                    {...bindFocus(state)}
                >
                    {icon}
                </IconButton>
            </Box>

            <Popover
                {...bindPopover(state)}
                anchorOrigin={DEFAULT_ANCHOR_ORIGIN}
                transformOrigin={DEFAULT_TRANSFORM_ORIGIN}
            >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    {children}
                </LocalizationProvider>
            </Popover>
        </>
    );
}

export default DateOrTimePickerWrapper;
