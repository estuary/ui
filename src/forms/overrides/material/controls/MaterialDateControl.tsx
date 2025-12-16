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

import { Hidden, Stack } from '@mui/material';

import { isDateControl, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import DatePickerCTA from 'src/components/shared/pickers/DatePickerCTA';
import useDatePickerState from 'src/components/shared/pickers/useDatePickerState';
import { CustomMaterialInputControl } from 'src/forms/overrides/material/controls/MaterialInputControl';
import { CustomMuiInputText } from 'src/forms/overrides/material/controls/MuiInputText';

// This is pretty customized
//  Look at MaterialDateTimeControl for extra notes
//  as this is based on that but made to support Date Picker
export const CustomMaterialDateControl = (props: ControlProps) => {
    const { data, id, visible, enabled, path, handleChange, label } = props;

    const { state, buttonRef, events } = useDatePickerState(
        `date-picker-${id}`
    );

    const onChange = (formattedValue: any) => {
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
                <DatePickerCTA
                    enabled={enabled}
                    label={label}
                    buttonRef={buttonRef}
                    state={state}
                    value={data}
                    onChange={onChange}
                />
            </Stack>
        </Hidden>
    );
};

export const materialDateControlTester: RankedTester = rankWith(
    10,
    isDateControl
);

export default withJsonFormsControlProps(CustomMaterialDateControl);
