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

import {
    and,
    isOneOfEnumControl,
    rankWith,
    scopeEndsWith,
} from '@jsonforms/core';
import { withJsonFormsOneOfEnumProps } from '@jsonforms/react';

import { CustomMaterialInputControl } from 'src/forms/overrides/material/controls/MaterialInputControl';
import { ConnectorAutoComplete } from 'src/forms/renderers/ConnectorSelect/AutoComplete';

export const CONNECTOR_IMAGE_SCOPE = 'connectorImage';

export const connectorTypeTester: RankedTester = rankWith(
    10,
    and(isOneOfEnumControl, scopeEndsWith(CONNECTOR_IMAGE_SCOPE))
);

const ConnectorTypeRenderer = (
    props: ControlProps & OwnPropsOfEnum & WithOptionLabel
) => {
    return (
        <CustomMaterialInputControl {...props} input={ConnectorAutoComplete} />
    );
};

export const ConnectorType = withJsonFormsOneOfEnumProps(ConnectorTypeRenderer);
