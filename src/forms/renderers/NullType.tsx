import { LayoutProps, RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import { Alert, Hidden } from '@mui/material';
import { CustomTypes } from 'types/jsonforms';

export const nullTypeTester: RankedTester = rankWith(
    9999,
    uiTypeIs(CustomTypes.nullable)
);

// This is blank on purpose. For right now we can just show null settings are nothing
const NullTypeRenderer = (props: LayoutProps) => {
    const {
        visible,
        path,
        uischema: { options: schemaOptions },
    } = props;

    // jsonforms - nullable
    // This is here so when connectors like Google Sheets have an Authentication
    //  that only has discriminator, title, and oneOf.
    // After we render the oneOf there is nothing left but the title and discriminator.
    // This leads to Custom_MaterialOneOfRenderer_Discriminator trying to get a UI schema
    //  from just a title and discriminator and deriveTypes will return no types.
    // There is a chance that a schema we are not planning for also gets a NullType at
    //  the root ref - but that chance is low and should be caught during testing.
    if (schemaOptions?.ref === '#') {
        return null;
    }

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
