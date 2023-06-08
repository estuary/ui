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
import { Box } from '@mui/material';
import PrefixedName from 'components/inputs/PrefixedName';
import { useCallback } from 'react';
import { useEndpointConfigStore_setEndpointCustomErrors } from 'stores/EndpointConfig/hooks';

export const CATALOG_NAME_SCOPE = 'entityName';

export const catalogNameTypeTester: RankedTester = rankWith(
    10,
    scopeEndsWith(CATALOG_NAME_SCOPE)
);

const CatalogNameTypeRenderer = (
    props: ControlProps & OwnPropsOfEnum & WithOptionLabel
) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { description, handleChange, uischema, path } = props;

    const setCustomErrors = useEndpointConfigStore_setEndpointCustomErrors();

    const updateFunction = useCallback(
        (prefixedName: string, errors: string | null) => {
            console.log(`prefixedName = ${path}`, { prefixedName, errors });
            handleChange(path, prefixedName);
            setCustomErrors([
                {
                    instancePath: path,
                    message: errors,
                    schemaPath: '',
                    keyword: '',
                    params: {},
                },
            ]);
        },
        [handleChange, path, setCustomErrors]
    );
    return (
        <Box
            sx={{
                '& .MuiFormHelperText-root.Mui-error': {
                    whiteSpace: 'break-spaces',
                },
            }}
        >
            <PrefixedName
                validateOnLoad
                standardVariant
                description={description}
                label={`${uischema.label}`}
                onChange={updateFunction}
            />
        </Box>
    );
};

export const CatalogName = withJsonFormsOneOfEnumProps(CatalogNameTypeRenderer);
