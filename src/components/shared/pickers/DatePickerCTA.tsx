import { Box, IconButton, Popover } from '@mui/material';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Calendar } from 'iconoir-react';
import { bindFocus, bindPopover } from 'material-ui-popup-state/hooks';
import { useIntl } from 'react-intl';
import { Patterns } from 'types/jsonforms';
import { INVALID_DATE } from './shared';
import { PickerProps } from './types';

function DatePickerCTA({
    enabled,
    label,
    buttonRef,
    state,
    value,
    onChange,
}: PickerProps) {
    const intl = useIntl();

    const formatDate = (formatValue: Date) => {
        try {
            return format(formatValue, Patterns.date);
        } catch (e: unknown) {
            return INVALID_DATE;
        }
    };

    return (
        <>
            <Box sx={{ paddingTop: 2 }}>
                <IconButton
                    aria-label={intl.formatMessage(
                        {
                            id: 'datePicker.button.ariaLabel',
                        },
                        {
                            label,
                        }
                    )}
                    disabled={!enabled}
                    ref={buttonRef}
                    {...bindFocus(state)}
                >
                    <Calendar />
                </IconButton>
            </Box>

            <Popover
                {...bindPopover(state)}
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
                    <StaticDatePicker
                        ignoreInvalidInputs
                        disableMaskedInput
                        displayStaticWrapperAs="desktop"
                        openTo="day"
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

export default DatePickerCTA;
