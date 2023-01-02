import { LayoutProps, RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import { Alert, Hidden } from '@mui/material';

export const nullTypeTester: RankedTester = rankWith(999, uiTypeIs('NullType'));

// This is blank on purpose. For right now we can just show null settings are nothing
const NullTypeRenderer = (props: LayoutProps) => {
    const {
        visible,
        path,
        uischema: { options: schemaOptions },
    } = props;
    return (
        <Hidden xsUp={!visible}>
            <Alert severity="error">
                Error: Invalid field definition at{' '}
                <code>
                    {path}: {schemaOptions?.ref}
                </code>
            </Alert>
        </Hidden>
    );
};

export const NullType = withJsonFormsLayoutProps(NullTypeRenderer);
