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
    isTimeControl,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import { MuiInputText } from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, Hidden, IconButton, Popover, Stack } from '@mui/material';
import { LocalizationProvider, StaticTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Patterns } from 'types/jsonforms';
import { hasLength } from 'utils/misc-utils';
import { CustomMaterialInputControl } from './MaterialInputControl';
import useDatePickerState from './useDatePickerState';

const INVALID_TIME = 'Invalid Time';

// This is pretty customized
//  Look at MaterialDateTimeControl for extra notes
//  as this is based on that but made to support Date Picker
export const Custom_MaterialTimeControl = (props: ControlProps) => {
    const { data, id, visible, enabled, path, handleChange, label } = props;

    const intl = useIntl();
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

    const formatDate = (value: Date) => {
        try {
            return format(value, Patterns.time);
        } catch (e: unknown) {
            return INVALID_TIME;
        }
    };

    const onChange = (value: any, keyboardInput?: string | undefined) => {
        if (value) {
            const formattedValue = formatDate(value);
            if (formattedValue && formattedValue !== INVALID_TIME) {
                setTimePickerValue(value);
                return handleChange(path, formattedValue);
            }
        }

        // Default to setting to what user typed
        //  This is a super backup as with the Date Fn adapter
        //  it never fell through to this... but wanted to be safe
        return handleChange(path, keyboardInput);
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
                    input={MuiInputText}
                    {...props}
                />
                <Box sx={{ paddingTop: 2 }}>
                    <IconButton
                        aria-label={intl.formatMessage(
                            {
                                id: 'timePicker.button.ariaLabel',
                            },
                            {
                                label,
                            }
                        )}
                        disabled={!enabled}
                        ref={buttonRef}
                        {...bindTrigger(state)}
                    >
                        <ScheduleIcon />
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
                        <StaticTimePicker
                            displayStaticWrapperAs="desktop"
                            ampm={false}
                            disabled={!enabled}
                            value={timePickerValue}
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

export const materialTimeControlTester: RankedTester = rankWith(
    10,
    isTimeControl
);

export default withJsonFormsControlProps(Custom_MaterialTimeControl);
