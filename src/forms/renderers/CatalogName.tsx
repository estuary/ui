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
import { MaterialInputControl } from '@jsonforms/material-renderers';
import { WithOptionLabel } from '@jsonforms/material-renderers/lib/mui-controls/MuiAutocomplete';
import { withJsonFormsOneOfEnumProps } from '@jsonforms/react';
import { Box } from '@mui/material';
import { CatalogNameAutoComplete } from 'forms/renderers/CatalogName/AutoComplete';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

export const CATALOG_NAME_SCOPE = 'entityName';

export const catalogNameTypeTester: RankedTester = rankWith(
    10,
    scopeEndsWith(CATALOG_NAME_SCOPE)
);

const CatalogNameTypeRenderer = (
    props: ControlProps & OwnPropsOfEnum & WithOptionLabel
) => {
    const { errors, schema } = props;

    // Get custom error message for catalog name issues so they
    //  are more readable for users
    const intl = useIntl();
    const customErrors = useMemo(() => {
        if (schema.pattern && errors.includes(schema.pattern)) {
            return intl.formatMessage({ id: 'custom.catalogName.pattern' });
        }

        return errors;
    }, [errors, intl, schema.pattern]);

    return (
        <Box
            sx={{
                '& .MuiFormHelperText-root.Mui-error': {
                    whiteSpace: 'break-spaces',
                },
            }}
        >
            <MaterialInputControl
                {...props}
                errors={customErrors}
                input={CatalogNameAutoComplete}
            />
        </Box>
    );
};

export const CatalogName = withJsonFormsOneOfEnumProps(CatalogNameTypeRenderer);
