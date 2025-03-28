import {
    ArrayLayoutProps,
    optionIs,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import { Unwrapped } from '@jsonforms/material-renderers';
import { withJsonFormsArrayLayoutProps } from '@jsonforms/react';

import { nullableRank } from './shared';

import { Options } from 'src/types/jsonforms';

const { MaterialArrayControlRenderer } = Unwrapped;

export const nullableArrayTester: RankedTester = rankWith(
    nullableRank + 1,
    optionIs(Options.nullable, 'array')
);

const NullableArrayRenderer = (props: ArrayLayoutProps) => {
    return <MaterialArrayControlRenderer {...props} />;
};

export const NullableArrayControl = withJsonFormsArrayLayoutProps(
    NullableArrayRenderer
);
