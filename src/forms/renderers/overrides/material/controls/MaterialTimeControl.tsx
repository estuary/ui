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
import type { ControlProps, RankedTester } from '@jsonforms/core';

import { useMemo, useState } from 'react';

import { Hidden, Stack } from '@mui/material';

import { isTimeControl, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import TimePickerCTA from 'src/components/shared/pickers/TimePickerCTA';
import useDatePickerState from 'src/components/shared/pickers/useDatePickerState';
import { CustomMaterialInputControl } from 'src/forms/renderers/overrides/material/controls/MaterialInputControl';
import { CustomMuiInputText } from 'src/forms/renderers/overrides/material/controls/MuiInputText';
import { hasLength } from 'src/utils/misc-utils';

// This is pretty customized
//  Look at MaterialDateTimeControl for extra notes
//  as this is based on that but made to support Date Picker
export const CustomMaterialTimeControl = (props: ControlProps) => {
    const { data, id, visible, enabled, path, handleChange, label } = props;

    const { state, buttonRef, events } = useDatePickerState(
        `time-picker-${id}`
    );

    // Need to set the default time for both create and edit
    //  This attempts to parse the current value and use it
    //  to set the defaultTime's hours, minutes, and seconds
    const defaultTime = useMemo(() => {
        let args: [number, number?, number?];
        const defaultValue = new Date();

        if (hasLength(data)) {
            args = data.split(':').map((val: string) => {
                const response = Number.parseInt(val, 10);

                return isNaN(response) ? 0 : response;
            });
        } else {
            args = [1, 0, 0];
        }

        defaultValue.setHours(...args);

        return defaultValue;

        // We only really care to set this once on load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [timePickerValue, setTimePickerValue] = useState(defaultTime);

    const onChange = (formattedValue: any, value: any) => {
        setTimePickerValue(value);
        return handleChange(path, formattedValue);
    };

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
                    input={CustomMuiInputText}
                    {...props}
                />
                <TimePickerCTA
                    enabled={enabled}
                    label={label}
                    buttonRef={buttonRef}
                    state={state}
                    value={timePickerValue}
                    onChange={onChange}
                />
            </Stack>
        </Hidden>
    );
};

export const materialTimeControlTester: RankedTester = rankWith(
    10,
    isTimeControl
);

export default withJsonFormsControlProps(CustomMaterialTimeControl);
