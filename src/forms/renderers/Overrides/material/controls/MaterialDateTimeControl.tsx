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
import {
    MaterialInputControl,
    MuiInputText,
} from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';
import EventIcon from '@mui/icons-material/Event';
import { Box, Hidden, IconButton, Popover, Stack } from '@mui/material';
import {
    LocalizationProvider,
    StaticDateTimePicker,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, formatRFC3339 } from 'date-fns';
import merge from 'lodash/merge';
import {
    bindPopover,
    bindTrigger,
    usePopupState,
} from 'material-ui-popup-state/hooks';
import { useCallback } from 'react';

const INVALID_DATE = 'Invalid Date';

// function removeTimezoneOffset(date: Date) {
//     const tzOffset = date.getTimezoneOffset();
//     return new Date(date.valueOf() + tzOffset * 60 * 1000);
// }

// This is SUPER customized. We change how this works a lot to make the form
//  simpler for users.
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
export const Custom_MaterialDateTimeControl = (props: ControlProps) => {
    const { id, uischema, visible, enabled, path, handleChange, data, config } =
        props;
    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    const saveFormat = appliedUiSchemaOptions.dateTimeSaveFormat ?? undefined;
    const views = appliedUiSchemaOptions.views ?? [
        'year',
        'day',
        'hours',
        'minutes',
    ];

    const popupState = usePopupState({
        variant: 'popover',
        popupId: `date-time-${id}`,
    });

    const formatDate = useCallback(
        (value: Date) => {
            try {
                const result = formatRFC3339(new Date(2019, 8, 18, 19, 0, 52));
                const foo = formatRFC3339(value);
                const bar = format(value, saveFormat);

                console.log('result', result);
                console.log('value', value);
                console.log('{foo, bar}', { foo, bar });
                return foo;
            } catch (e: unknown) {
                return INVALID_DATE;
            }
        },
        [saveFormat]
    );

    const closePopover = () => {
        popupState.close();
    };

    const onChange = useCallback(
        (value: any, keyboardInput?: string | undefined) => {
            // Try to use value from the date picker first
            if (value) {
                const formattedValue = formatDate(value);
                if (formattedValue && formattedValue !== INVALID_DATE) {
                    return handleChange(path, formattedValue);
                }
            }

            // Default to setting the value to whatever the user typed
            return handleChange(path, keyboardInput);
        },
        [formatDate, handleChange, path]
    );

    return (
        <Hidden xsUp={!visible}>
            <Stack
                sx={{
                    alignItems: 'top',
                }}
                direction="row"
            >
                <MaterialInputControl input={MuiInputText} {...props} />
                <Box sx={{ paddingTop: 1 }}>
                    <IconButton
                        aria-label="delete"
                        disabled={!enabled}
                        {...bindTrigger(popupState)}
                    >
                        <EventIcon />
                    </IconButton>
                </Box>

                <Popover
                    {...bindPopover(popupState)}
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
                            ampm={false}
                            disabled={!enabled}
                            displayStaticWrapperAs="desktop"
                            openTo="day"
                            views={views}
                            value={data}
                            onChange={onChange}
                            onAccept={closePopover}
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
