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
import type { ControlProps } from '@jsonforms/core';

import { FormControl, FormHelperText, InputLabel } from '@mui/material';

import { isDescriptionHidden, showAsRequired } from '@jsonforms/core';
import { useFocus } from '@jsonforms/material-renderers';

import { endsWith } from 'lodash';
import merge from 'lodash/merge';

import { CLEAR_BUTTON_ID_SUFFIX } from 'src/components/shared/pickers/shared';

export interface WithInput {
    input: any;
}

interface Props {
    inputEvents?: {
        keyDown: (event?: any) => any;
        focus: (event?: any) => any;
    };
}

// Customizations:
//  1. inputEvents
//    Allows you to pass in a focus function that fires when the input is focused
//  2. FormControl disable-able :
//    This uses the `enabled` flag to set `disable` on form control so labels and helper text show as disabled
export const CustomMaterialInputControl = (
    props: Props & ControlProps & WithInput
) => {
    const [focused, onFocus, onBlur] = useFocus();
    const {
        id,
        description,
        enabled,
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

    if (!visible) {
        return null;
    }

    return (
        <FormControl
            disabled={!enabled}
            fullWidth={!appliedUiSchemaOptions.trim}
            id={id}
            variant="standard"
            onBlur={onBlur}
            onFocus={
                inputEvents
                    ? (event) => {
                          if (
                              endsWith(
                                  event.target.id,
                                  CLEAR_BUTTON_ID_SUFFIX
                              )
                          ) {
                              // Clear button was clicked so we do not want to fire the focus event
                              // Return here so we do not fire the focus events. This way when a user
                              //  clicks on the reset button the date picker is not opened right up
                              return;
                          }

                          inputEvents.focus();
                          onFocus();
                      }
                    : undefined
            }
            onKeyDown={
                inputEvents
                    ? () => {
                          inputEvents.keyDown();
                      }
                    : undefined
            }
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
    );
};
