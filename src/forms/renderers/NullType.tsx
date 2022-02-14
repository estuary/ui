import { RankedTester, rankWith, schemaTypeIs } from '@jsonforms/core';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import { Hidden } from '@mui/material';

export const nullTypeTester: RankedTester = rankWith(999, schemaTypeIs('null'));

// This is blank on purpose. For right now we can just show null settings are nothing
const NullTypeRenderer = (props: any) => {
    const { visible } = props;
    return <Hidden xsUp={!visible}> </Hidden>;
};

export const NullType = withJsonFormsLayoutProps(NullTypeRenderer);
