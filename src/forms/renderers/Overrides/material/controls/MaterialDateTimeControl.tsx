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
import { Hidden, Stack } from '@mui/material';

import DateTimePickerCTA from 'components/shared/pickers/DateTimePickerCTA';
import { TIMEZONE_OFFSET_REPLACEMENT } from 'components/shared/pickers/shared';
import useDatePickerState from 'components/shared/pickers/useDatePickerState';
import { CustomMaterialInputControl } from './MaterialInputControl';

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

    const { state, buttonRef, events } = useDatePickerState(
        `date-time-picker-${id}`
    );

    const onChange = (formattedValue: any) => {
        return handleChange(path, formattedValue);
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
                <DateTimePickerCTA
                    enabled={enabled}
                    label={label}
                    buttonRef={buttonRef}
                    state={state}
                    value={dateTimePickerValue}
                    onChange={onChange}
                />
            </Stack>
        </Hidden>
    );
};

export const materialDateTimeControlTester: RankedTester = rankWith(
    10,
    isDateTimeControl
);

export default withJsonFormsControlProps(Custom_MaterialDateTimeControl);
