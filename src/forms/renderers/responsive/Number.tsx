import type { ControlProps, RankedTester } from '@jsonforms/core';

import { and, isNumberControl, rankWith } from '@jsonforms/core';
import { Unwrapped } from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { GridWrapper } from 'src/forms/renderers/responsive/GridWrapper';

const { MaterialNumberControl } = Unwrapped;

export const responsiveNumber = (props: ControlProps) => {
    return (
        <GridWrapper>
            <MaterialNumberControl {...props} />
        </GridWrapper>
    );
};

export const responsiveNumberTester: RankedTester = rankWith(
    999,
    and(isNumberControl)
);

export const ResponsiveNumber = withJsonFormsControlProps(responsiveNumber);
