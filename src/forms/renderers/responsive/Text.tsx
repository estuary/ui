import {
    and,
    ControlProps,
    isStringControl,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import { Unwrapped } from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { GridWrapper } from 'forms/renderers/responsive/GridWrapper';

const { MaterialTextControl } = Unwrapped;

export const responsiveText = (props: ControlProps) => {
    return (
        <GridWrapper>
            <MaterialTextControl {...props} />
        </GridWrapper>
    );
};

export const responsiveTextTester: RankedTester = rankWith(
    999,
    and(isStringControl)
);

export const ResponsiveText = withJsonFormsControlProps(responsiveText);
