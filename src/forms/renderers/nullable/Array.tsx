import {
    ArrayLayoutProps,
    optionIs,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import { withJsonFormsArrayLayoutProps } from '@jsonforms/react';
import { Options } from 'src/types/jsonforms';
import { Unwrapped } from '@jsonforms/material-renderers';
import { nullableRank } from './shared';

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
