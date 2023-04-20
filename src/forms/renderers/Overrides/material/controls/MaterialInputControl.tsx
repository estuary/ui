/* eslint-disable react/jsx-no-leaked-render */
/*
  The MIT License

  Copyright (c) 2017-2021 EclipseSource Munich
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
    isDescriptionHidden,
    showAsRequired,
} from '@jsonforms/core';
import { useFocus } from '@jsonforms/material-renderers';

import { FormControl, FormHelperText, Hidden, InputLabel } from '@mui/material';
import merge from 'lodash/merge';

export interface WithInput {
    input: any;
}

interface Props {
    inputEvents: {
        focus: (event?: any) => any;
        keyDown: (event?: any) => any;
    };
}

// ONLY USE THIS WHEN YOU NEED TO CONTROL FOCUS.
// Customizations:
//  1. inputEvents
//    Allows you to pass in a focus function that fires when the input is focused
//
export const CustomMaterialInputControl = (
    props: Props & ControlProps & WithInput
) => {
    const [focused, onFocus, onBlur] = useFocus();
    const {
        id,
        description,
        errors,
        label,
        uischema,
        visible,
        required,
        config,
        input,
        inputEvents,
    } = props;
    const isValid = errors.length === 0;
    const appliedUiSchemaOptions = merge({}, config, uischema.options);

    const showDescription = !isDescriptionHidden(
        visible,
        description,
        focused,
        appliedUiSchemaOptions.showUnfocusedDescription
    );

    const firstFormHelperText = showDescription
        ? description
        : !isValid
        ? errors
        : null;
    const secondFormHelperText = showDescription && !isValid ? errors : null;
    const InnerComponent = input;

    const onFocusHandler = () => {
        inputEvents.focus();
        onFocus();
    };

    const onKeydown = () => {
        inputEvents.keyDown();
    };

    return (
        <Hidden xsUp={!visible}>
            <FormControl
                fullWidth={!appliedUiSchemaOptions.trim}
                onFocus={onFocusHandler}
                onBlur={onBlur}
                id={id}
                variant="standard"
                onKeyDown={onKeydown}
            >
                <InputLabel
                    htmlFor={`${id}-input`}
                    error={!isValid}
                    required={showAsRequired(
                        required ?? false,
                        appliedUiSchemaOptions.hideRequiredAsterisk
                    )}
                >
                    {label}
                </InputLabel>
                <InnerComponent
                    {...props}
                    id={`${id}-input`}
                    isValid={isValid}
                    visible={visible}
                />
                <FormHelperText error={!isValid && !showDescription}>
                    {firstFormHelperText}
                </FormHelperText>
                <FormHelperText error={!isValid}>
                    {secondFormHelperText}
                </FormHelperText>
            </FormControl>
        </Hidden>
    );
};
