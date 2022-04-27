import { RankedTester, rankWith, schemaTypeIs } from '@jsonforms/core';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import { Hidden } from '@mui/material';

export const connectorTypeTester: RankedTester = rankWith(
    999,
    schemaTypeIs('null')
);

// This is blank on purpose. For right now we can just show null settings are nothing
const ConnectorTypeRenderer = (props: any) => {
    const { visible } = props;
    return <Hidden xsUp={!visible}> </Hidden>;
};

export const ConnectorType = withJsonFormsLayoutProps(ConnectorTypeRenderer);
