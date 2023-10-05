import { Box, IconButton, Popover } from '@mui/material';
import {
    LocalizationProvider,
    StaticDateTimePicker,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatRFC3339 } from 'date-fns';
import { Calendar } from 'iconoir-react';
import { bindFocus, bindPopover } from 'material-ui-popup-state/hooks';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { INVALID_DATE, TIMEZONE_OFFSET_REPLACEMENT } from './shared';
import { PickerProps } from './types';

const TIMEZONE_OFFSET = new RegExp('([+-][0-9]{2}:[0-9]{2})$');

function DateTimePickerCTA({
    enabled,
    label,
    buttonRef,
    state,
    value,
    onChange,
}: PickerProps) {
    const intl = useIntl();

    // We have a special handler that formats the date so that
    //  it can handle if there was an error formatting, always
    //  use RFC3339, replace the seconds with 'OO'
    //  and replace the TZ Offset with an actual "Z"
    const formatDate = (formatValue: Date) => {
        try {
            return formatRFC3339(formatValue).replace(
                TIMEZONE_OFFSET,
                TIMEZONE_OFFSET_REPLACEMENT
            );
        } catch (e: unknown) {
            return INVALID_DATE;
        }
    };

    const focusProps = useMemo(() => bindFocus(state), [state]);
    const popoverProps = useMemo(() => bindPopover(state), [state]);

    console.log('buttonRef.current ', buttonRef.current);
    console.log('focusProps', focusProps);
    console.log('popoverProps', popoverProps);

    return (
        <>
            <Box sx={{ paddingTop: 2 }}>
                <IconButton
                    aria-label={intl.formatMessage(
                        {
                            id: 'dateTimePicker.button.ariaLabel',
                        },
                        {
                            label,
                        }
                    )}
                    disabled={!enabled}
                    ref={buttonRef}
                    {...focusProps}
                >
                    <Calendar />
                </IconButton>
            </Box>

            <Popover
                {...popoverProps}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                }}
            >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <StaticDateTimePicker
                        ignoreInvalidInputs
                        disableMaskedInput
                        displayStaticWrapperAs="desktop"
                        openTo="day"
                        ampm={false}
                        disabled={!enabled}
                        value={value}
                        onChange={(
                            onChangeValue: any,
                            keyboardInput?: string | undefined
                        ) => {
                            if (onChangeValue) {
                                const formattedValue =
                                    formatDate(onChangeValue);
                                if (
                                    formattedValue &&
                                    formattedValue !== INVALID_DATE
                                ) {
                                    return onChange(
                                        formattedValue,
                                        onChangeValue
                                    );
                                }
                            }

                            // Default to setting to what user typed
                            //  This is a super backup as with the Date Fn adapter
                            //  it never fell through to this... but wanted to be safe
                            return onChange(keyboardInput, keyboardInput);
                        }}
                        onAccept={state.close}
                        closeOnSelect={true}
                        // We don't need an input
                        // eslint-disable-next-line react/jsx-no-useless-fragment
                        renderInput={() => <></>}
                    />
                </LocalizationProvider>
            </Popover>
        </>
    );
}

export default DateTimePickerCTA;
