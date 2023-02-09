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
    isDateControl,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import {
    MaterialInputControl,
    MuiInputText,
} from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, Hidden, IconButton, Popover, Stack } from '@mui/material';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Calendar } from 'iconoir-react';
import {
    bindPopover,
    bindTrigger,
    usePopupState,
} from 'material-ui-popup-state/hooks';
import { useIntl } from 'react-intl';
import { Patterns } from 'types/jsonforms';

const INVALID_DATE = 'Invalid Date';

// This is pretty customized
//  Look at MaterialDateTimeControl for extra notes
//  as this is based on that but made to support Date Picker
export const Custom_MaterialDateControl = (props: ControlProps) => {
    const { data, id, visible, enabled, path, handleChange, label } = props;

    const intl = useIntl();
    const popupState = usePopupState({
        variant: 'popover',
        popupId: `date-picker-${id}`,
    });

    const formatDate = (value: Date) => {
        try {
            return format(value, Patterns.date);
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

    return (
        <Hidden xsUp={!visible}>
            <Stack
                sx={{
                    alignItems: 'top',
                }}
                direction="row"
            >
                <MaterialInputControl input={MuiInputText} {...props} />
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
                        {...bindTrigger(popupState)}
                    >
                        <Calendar />
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
                        <StaticDatePicker
                            ignoreInvalidInputs
                            disableMaskedInput
                            displayStaticWrapperAs="desktop"
                            openTo="day"
                            disabled={!enabled}
                            value={data}
                            onChange={onChange}
                            onAccept={popupState.close}
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

export const materialDateControlTester: RankedTester = rankWith(
    10,
    isDateControl
);

export default withJsonFormsControlProps(Custom_MaterialDateControl);
