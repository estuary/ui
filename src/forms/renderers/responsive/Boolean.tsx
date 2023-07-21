import {
    and,
    ControlProps,
    isBooleanControl,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import { Unwrapped } from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { GridWrapper } from 'forms/renderers/responsive/GridWrapper';

const { MaterialBooleanControl } = Unwrapped;

export const responsiveBoolean = (props: ControlProps) => {
    return (
        <GridWrapper>
            <MaterialBooleanControl {...props} />
        </GridWrapper>
    );
};

export const responsiveBooleanTester: RankedTester = rankWith(
    999,
    and(isBooleanControl)
);

export const ResponsiveBoolean = withJsonFormsControlProps(responsiveBoolean);
