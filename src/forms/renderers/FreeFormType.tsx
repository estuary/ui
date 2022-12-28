import {
    and,
    isObjectControl,
    LayoutProps,
    RankedTester,
    rankWith,
    schemaMatches,
} from '@jsonforms/core';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import { Alert, Hidden } from '@mui/material';

export const freeFormTypeTester: RankedTester = rankWith(
    999,
    and(
        isObjectControl,
        schemaMatches((schema) => {
            return schema.additionalProperties === true;
        })
    )
);

const FreeFormInput = (props: LayoutProps) => {
    const {
        visible,
        path,
        uischema: { options: schemaOptions },
    } = props;
    return (
        <Hidden xsUp={!visible}>
            <Alert severity="error">
                Error: Freeform input not yet supported at:{' '}
                <code>
                    {path}: {schemaOptions?.ref}
                </code>
            </Alert>
        </Hidden>
    );
};

export const FreeFormType = withJsonFormsLayoutProps(FreeFormInput);
