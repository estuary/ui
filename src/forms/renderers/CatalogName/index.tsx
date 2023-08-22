/*
  The MIT License

  Copyright (c) 2018-2020 EclipseSource Munich
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
    OwnPropsOfEnum,
    RankedTester,
    rankWith,
    scopeEndsWith,
} from '@jsonforms/core';
import { WithOptionLabel } from '@jsonforms/material-renderers/lib/mui-controls/MuiAutocomplete';
import { withJsonFormsOneOfEnumProps } from '@jsonforms/react';
import PrefixedName from 'components/inputs/PrefixedName';
import { PrefixedName_Change } from 'components/inputs/PrefixedName/types';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import { useDetailsForm_setCustomErrors } from 'stores/DetailsForm/hooks';
import { generateCustomError } from 'stores/extensions/CustomErrors';

export const CATALOG_NAME_SCOPE = 'entityName';

export const catalogNameTypeTester: RankedTester = rankWith(
    10,
    scopeEndsWith(CATALOG_NAME_SCOPE)
);

const CatalogNameTypeRenderer = ({
    data,
    enabled,
    handleChange,
    path,
    required,
    uischema,
}: ControlProps & OwnPropsOfEnum & WithOptionLabel) => {
    const intl = useIntl();
    const hackyTimeout = useRef<number | null>(null);

    const isEdit = useEntityWorkflow_Editing();
    const setCustomErrors = useDetailsForm_setCustomErrors();

    const updateFunction = useCallback<PrefixedName_Change>(
        (prefixedName, errorString) => {
            handleChange(path, prefixedName);

            // TODO (JSONForms) This is hacky but it works.
            //  setting custom errors right away can cause re-renders that will
            //  mess up populating the correct catalog name
            // The 50 buffer time helps when someone is pasting in a name and
            //  very quickly clicks next
            hackyTimeout.current = window.setTimeout(() => {
                const customErrors = [];

                // Just replace all specific errors with a simple "invalid" error
                if (errorString) {
                    customErrors.push(
                        generateCustomError(
                            path,
                            intl.formatMessage({
                                id: 'entityCreate.endpointConfig.entityNameInvalid',
                            })
                        )
                    );
                }

                setCustomErrors(customErrors);
            }, 50);
        },
        [handleChange, intl, path, setCustomErrors]
    );

    useUnmount(() => {
        if (hackyTimeout.current) {
            clearTimeout(hackyTimeout.current);
        }
    });

    return (
        <PrefixedName
            disabled={!enabled}
            label={`${uischema.label}`}
            onChange={updateFunction}
            required={required}
            showDescription
            size="medium"
            standardVariant
            validateOnLoad={!isEdit}
            value={isEdit ? data : undefined}
        />
    );
};

export const CatalogName = withJsonFormsOneOfEnumProps(CatalogNameTypeRenderer);
