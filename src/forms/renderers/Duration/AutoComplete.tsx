// We  heavily base this off JsonForms stuff so tweaking linting options they don't use
/* eslint-disable @typescript-eslint/unbound-method */

/*
  The MIT License

  Copyright (c) 2017-2020 EclipseSource Munich
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
import { ControlProps, EnumOption, WithClassname } from '@jsonforms/core';
import {
    Autocomplete,
    AutocompleteRenderOptionState,
    FilterOptionsState,
    Input,
} from '@mui/material';
import React, { ReactNode, useLayoutEffect, useMemo, useRef } from 'react';
import { detectAutoCompleteInputReset } from 'utils/mui-utils';
import { ISO_8601_DURATION_RE } from 'validation';

export interface WithOptionLabel {
    getOptionLabel?(option: EnumOption): string;
    renderOption?(
        props: React.HTMLAttributes<HTMLLIElement>,
        option: EnumOption,
        state: AutocompleteRenderOptionState
    ): ReactNode;
    filterOptions?(
        options: EnumOption[],
        state: FilterOptionsState<EnumOption>
    ): EnumOption[];
}

const DURATION_OPTIONS = [
    '0s',
    '30s',
    '1m',
    '5m',
    '15m',
    '30m',
    '1h',
    '2h',
    '4h',
    '6h',
    '12h',
];

export const DurationAutoComplete = ({
    className,
    data,
    enabled,
    handleChange,
    id,
    path,
    schema,
}: ControlProps & WithClassname) => {
    const currentOption = useMemo(
        () => (DURATION_OPTIONS.includes(data) ? data : null),
        [data]
    );

    const [inputValue, setInputValue] = React.useState(data);
    const inputRef = useRef<any | null>(null);
    const position = useRef({
        beforeStart: 0,
        beforeEnd: 0,
    });
    useLayoutEffect(() => {
        // Make sure the cursor stays where we want it
        inputRef.current
            ?.querySelector?.('input')
            .setSelectionRange?.(
                position.current.beforeStart,
                position.current.beforeEnd
            );
    }, [inputValue]);

    return (
        <Autocomplete
            autoComplete
            className={className}
            disabled={!enabled}
            freeSolo
            fullWidth
            id={id}
            inputValue={inputValue}
            options={DURATION_OPTIONS}
            ref={inputRef} // This is not great... but needed to control the cursor
            renderInput={({ InputProps, disabled, fullWidth, inputProps }) => {
                // We need to make sure we got a ref that can resolve to find the `input`
                //  we are looking for. So if that is not there yet overwrite whatever
                //  is in the current ref. This is kind of an overkill approach.
                if (!inputRef.current?.querySelector && inputProps.ref) {
                    inputRef.current = inputProps.ref;
                }

                return (
                    <Input
                        {...InputProps}
                        inputProps={{
                            ...inputProps,
                        }}
                        fullWidth={fullWidth}
                        disabled={disabled}
                        style={{ textTransform: 'uppercase' }}
                    />
                );
            }}
            includeInputInList
            sx={{
                mt: 2,
            }}
            value={currentOption}
            onInputChange={(event, newInputValue, reason) => {
                if (reason === 'clear' && schema.default) {
                    // TODO (jsonforms default) we need to set this so we can keep
                    //  the data and inputValue in sync easily. Otherwise the user
                    //  could not tell that the value was put back as the default
                    //  because the input would have stayed empty.
                    setInputValue(schema.default);
                    handleChange(path, schema.default);

                    // Reset the cursor position as well
                    position.current = {
                        beforeStart: schema.default.length,
                        beforeEnd: schema.default.length,
                    };
                    return;
                }

                // If the user is typing we want to upper case since the duration pattern is all
                //  capital letters. If they select one we should just leave it
                const newInputValueUpper = detectAutoCompleteInputReset(reason)
                    ? newInputValue
                    : newInputValue.toUpperCase();

                setInputValue(newInputValueUpper);

                // @ts-expect-error these props were always there and we are using a normal input
                // Just adding an if here because the typing seems wrong from MUI but want to be safe
                if (event.target.selectionStart && event.target.selectionEnd) {
                    // Save off where the cursor was when they typed so we can put it back
                    //  since we are upper casing the input value
                    position.current = {
                        // @ts-expect-error see up above
                        beforeStart: event.target.selectionStart,

                        // @ts-expect-error see up above
                        beforeEnd: event.target.selectionEnd,
                    };
                }

                // Updating with the proper value and see if we need to make it match the duration format
                handleChange(
                    path,
                    `${
                        ISO_8601_DURATION_RE.test(newInputValueUpper)
                            ? ''
                            : 'PT'
                    }${newInputValueUpper}`.toUpperCase()
                );
            }}
        />
    );
};
