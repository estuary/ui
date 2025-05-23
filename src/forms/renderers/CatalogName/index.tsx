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

import type {
    ControlProps,
    OwnPropsOfEnum,
    RankedTester,
} from '@jsonforms/core';
import type { WithOptionLabel } from '@jsonforms/material-renderers/lib/mui-controls/MuiAutocomplete';
import type { PrefixedName_Change } from 'src/components/inputs/PrefixedName/types';

import { useCallback } from 'react';

import { rankWith, scopeEndsWith } from '@jsonforms/core';
import { withJsonFormsOneOfEnumProps } from '@jsonforms/react';

import PrefixedName from 'src/components/inputs/PrefixedName';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';

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
    const isEdit = useEntityWorkflow_Editing();
    const entityType = useEntityType();

    const updateFunction = useCallback<PrefixedName_Change>(
        (prefixedName) => {
            handleChange(path, prefixedName);
        },
        [handleChange, path]
    );

    return (
        <PrefixedName
            disabled={!enabled}
            label={`${uischema.label}`}
            entityType={entityType}
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
