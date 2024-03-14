import { optionIs, RankedTester, rankWith } from '@jsonforms/core';
import { MaterialArrayControlRenderer } from '@jsonforms/material-renderers';
import { withJsonFormsArrayLayoutProps } from '@jsonforms/react';
import { Options } from 'types/jsonforms';
import { nullableRank } from './shared';

export const nullableArrayTester: RankedTester = rankWith(
    nullableRank + 1,
    optionIs(Options.nullable, 'array')
);

const NullableArrayRenderer = (props: any) => {
    return <MaterialArrayControlRenderer {...props} />;
};

export const NullableArrayControl = withJsonFormsArrayLayoutProps(
    NullableArrayRenderer
);
