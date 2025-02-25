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
    const position = useRef({
        beforeStart: 0,
        beforeEnd: 0,
    });
    const [inputValue, setInputValue] = React.useState(data);
    const inputRef = useRef<any | null>(null);

    const currentOption = useMemo(
        () => (DURATION_OPTIONS.includes(data) ? data : null),
        [data]
    );

    useLayoutEffect(() => {
        // Make sure the cursor stays where we want it
        inputRef.current?.setSelectionRange?.(
            position.current.beforeStart,
            position.current.beforeEnd
        );
    }, [inputValue]);

    return (
        <Autocomplete
            autoComplete
            blurOnSelect
            className={className}
            disabled={!enabled}
            freeSolo
            fullWidth
            id={id}
            inputValue={inputValue}
            ref={inputRef}
            options={DURATION_OPTIONS}
            renderInput={({ InputProps, disabled, fullWidth, inputProps }) => {
                // We want to use MUI's ref because they are using that to handle
                //  some interactions for us
                if (!inputRef.current) {
                    inputRef.current = InputProps.ref;
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
                // TODO (jsonforms default) we need to set this so we can keep
                //  the data and inputValue in sync easily.
                if (reason === 'clear' && schema.default) {
                    setInputValue(schema.default);
                    handleChange(path, schema.default);
                    return;
                }

                // If the user is typing we want to upper case since the duration pattern is all
                //  capital letters. If they select one we should just leave it
                const newInputValueUpper = detectAutoCompleteInputReset(reason)
                    ? newInputValue
                    : newInputValue.toUpperCase();

                setInputValue(newInputValueUpper);

                // If the input is cleared out for any reason so ahead and set null
                //  so we know the field is empty
                if (newInputValueUpper === '') {
                    setInputValue(newInputValue);
                    handleChange(path, null);
                    return;
                }

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
