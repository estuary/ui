/* eslint-disable @typescript-eslint/unbound-method */
/*
  The MIT License
  
  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import {
    ControlProps,
    isDateTimeControl,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import { MuiInputText } from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, Hidden, IconButton, Popover, Stack } from '@mui/material';
import {
    LocalizationProvider,
    StaticDateTimePicker,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatRFC3339 } from 'date-fns';
import { Calendar } from 'iconoir-react';
import { bindFocus, bindPopover } from 'material-ui-popup-state/hooks';
import { useIntl } from 'react-intl';
import { CustomMaterialInputControl } from './MaterialInputControl';
import useDatePickerState from './useDatePickerState';

const INVALID_DATE = 'Invalid Date';
const TIMEZONE_OFFSET = new RegExp('([+-][0-9]{2}:[0-9]{2})$');
const TIMEZONE_OFFSET_REPLACEMENT = 'Z';

// This is SUPER customized
// Customizations:
//  1. Use Static Date Time Picker
//      We stopped using the MUI DateTimePicker and switched to the static one
//      This allows us to format the input only when the user is using the date
//      picker. The original approach would try to format the input on every keystroke
//      and it made it difficult to edit.
//  2. Use Date Fns
//      We already have a date format library so DayJS was not needed. Also, it
//      tries REALLY hard to understand what a user is meaning and will basically
//      work around almost anything you type and give you a date back. Example:
//      if a user types "2020" into the input then DayJS immedietly will format that to
//      something like "2020-01-01T01:00:00Z"
//  3. Mess with data format
//      We always want to send back an actual "Z" with this input and never send
//      back an actual time zone offset. To accomplish this we just mess with the
//      value onChange. However, to make sure when a user opens the DateTimePicker
//      it opens to their selection we need to feed the data back into the picker.
//      This requires that we remove the "Z" (that we inject) before opening the picker
//      otherwise the picker will try to adjust the timezone again.

export const Custom_MaterialDateTimeControl = (props: ControlProps) => {
    const { data, id, visible, enabled, path, handleChange, label } = props;

    const intl = useIntl();
    const { state, buttonRef, events } = useDatePickerState(
        `date-time-picker-${id}`
    );

    // We have a special handler that formats the date so that
    //  it can handle if there was an error formatting, always
    //  use RFC3339, replace the seconds with 'OO'
    //  and replace the TZ Offset with an actual "Z"
    const formatDate = (value: Date) => {
        try {
            return formatRFC3339(value).replace(
                TIMEZONE_OFFSET,
                TIMEZONE_OFFSET_REPLACEMENT
            );
        } catch (e: unknown) {
            return INVALID_DATE;
        }
    };

    const onChange = (value: any, keyboardInput?: string | undefined) => {
        if (value) {
            const formattedValue = formatDate(value);
            if (formattedValue && formattedValue !== INVALID_DATE) {
                return handleChange(path, formattedValue);
            }
        }

        // Default to setting to what user typed
        //  This is a super backup as with the Date Fn adapter
        //  it never fell through to this... but wanted to be safe
        return handleChange(path, keyboardInput);
    };

    // We need to remove the Z here so that the date time picker
    //  can open up to the proper date time but not try to adjust
    //  it with the local timezone offset
    const dateTimePickerValue = data
        ? data.replace(TIMEZONE_OFFSET_REPLACEMENT, '')
        : null;

    return (
        <Hidden xsUp={!visible}>
            <Stack
                sx={{
                    alignItems: 'top',
                }}
                direction="row"
            >
                <CustomMaterialInputControl
                    inputEvents={events}
                    input={MuiInputText}
                    {...props}
                />
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
                        <StaticDateTimePicker
                            ignoreInvalidInputs
                            disableMaskedInput
                            displayStaticWrapperAs="desktop"
                            openTo="day"
                            ampm={false}
                            disabled={!enabled}
                            value={dateTimePickerValue}
                            onChange={onChange}
                            onAccept={state.close}
                            closeOnSelect={true}
                            // We don't need an input
                            // eslint-disable-next-line react/jsx-no-useless-fragment
                            renderInput={() => <></>}
                        />
                    </LocalizationProvider>
                </Popover>
            </Stack>
        </Hidden>
    );
};

export const materialDateTimeControlTester: RankedTester = rankWith(
    10,
    isDateTimeControl
);

export default withJsonFormsControlProps(Custom_MaterialDateTimeControl);
