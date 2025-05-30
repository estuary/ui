// We  heavily base this off JsonForms stuff so tweaking linting options they don't use
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

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
import type { ControlProps, WithClassname } from '@jsonforms/core';

import React, { useLayoutEffect, useMemo, useRef } from 'react';

import { Autocomplete, Input } from '@mui/material';

import { ISO_8601_DURATION_RE } from 'src/validation';

const DURATION_TIME_PREFIX = 'PT';
const DURATION_OPTIONS = [
    { label: '0s', id: `${DURATION_TIME_PREFIX}0S` },
    { label: '30s', id: `${DURATION_TIME_PREFIX}30S` },
    { label: '1m', id: `${DURATION_TIME_PREFIX}1M` },
    { label: '5m', id: `${DURATION_TIME_PREFIX}5M` },
    { label: '15m', id: `${DURATION_TIME_PREFIX}15M` },
    { label: '30m', id: `${DURATION_TIME_PREFIX}30M` },
    { label: '1h', id: `${DURATION_TIME_PREFIX}1H` },
    { label: '2h', id: `${DURATION_TIME_PREFIX}2H` },
    { label: '4h', id: `${DURATION_TIME_PREFIX}4H` },
    { label: '6h', id: `${DURATION_TIME_PREFIX}6H` },
    { label: '12h', id: `${DURATION_TIME_PREFIX}12H` },
];

const areOptionsEqual = (option?: any, value?: any) => {
    return (option?.id ?? option) === (value?.id ?? value);
};

// TODO (JSONForms) - this field will render incorrectly unless the `currentBinding` is set to null
//  while switching bindings.
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
        () =>
            DURATION_OPTIONS.find((option) => areOptionsEqual(option, data)) ??
            null,
        [data]
    );

    const [inputValue, setInputValue] = React.useState(data);

    // These all handle controlling the cursor position so it does not
    //  auto move to the end when a user types a lower case letter and
    //  we upper case it.
    // https://giacomocerquone.com/blog/keep-input-cursor-still/
    const inputRef = useRef<any | null>(null);
    const position = useRef({
        beforeStart: 0,
        beforeEnd: 0,
    });
    useLayoutEffect(() => {
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
            includeInputInList
            inputValue={inputValue}
            isOptionEqualToValue={areOptionsEqual}
            openOnFocus
            options={DURATION_OPTIONS}
            ref={inputRef} // This is not great as this is internal... but needed to control the cursor
            sx={{
                mt: 2,
            }}
            value={currentOption}
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
                    />
                );
            }}
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
                //  capital letters.
                const newInputValueUpper = newInputValue.toUpperCase();

                setInputValue(newInputValueUpper);

                // Why all the ts comments?
                //      1. Just adding an if here because the typing seems wrong from MUI but want to be safe
                //      2. The event ***100%*** came in null during initial loading - the typing is messed up
                if (
                    // @ts-expect-error these props were always there and we are using a normal input
                    event?.target.selectionStart &&
                    // @ts-expect-error these props were always there and we are using a normal input
                    event?.target.selectionEnd
                ) {
                    position.current = {
                        // @ts-expect-error see up above
                        beforeStart: event.target.selectionStart,
                        // @ts-expect-error see up above
                        beforeEnd: event.target.selectionEnd,
                    };
                }

                // Updating with the proper value and see if we need to make it match the duration format
                // Sadly there is a M for month and M for minute so this is not _super_ perfect. However,
                //  I am guessing if a user wants a custom duration they know how to type in the format
                //  themselves.
                handleChange(
                    path,
                    `${
                        ISO_8601_DURATION_RE.test(newInputValueUpper)
                            ? ''
                            : 'PT'
                    }${newInputValueUpper}`
                );
            }}
        />
    );
};
