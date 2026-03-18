import type {
    ControlProps,
    EnumOption,
    OwnPropsOfEnum,
    RankedTester,
} from '@jsonforms/core';
import type { WithOptionLabel } from '@jsonforms/material-renderers';
import type { TranslateProps } from '@jsonforms/react';

import React, { useMemo } from 'react';

import { Stack, Typography } from '@mui/material';

import { and, isOneOfEnumControl, optionIs, rankWith } from '@jsonforms/core';
import { MuiAutocomplete } from '@jsonforms/material-renderers';
import {
    withJsonFormsOneOfEnumProps,
    withTranslateProps,
} from '@jsonforms/react';

import { ONE_OF_WITH_DESCRIPTIONS } from 'src/services/jsonforms/shared';

interface CustomEnumProps extends EnumOption {
    description: string;
}

// Based on jsonforms/packages/material-renderers/src/controls/MaterialOneOfEnumControl.tsx
// Customizations
//  1. adding support for a custom option renderer
//  2. adding extra properties to the options to make the values easier to read
const MaterialEnumControlWith_Description = (
    props: ControlProps & OwnPropsOfEnum & WithOptionLabel & TranslateProps
) => {
    const { errors, schema } = props;

    // the options by default only provide a `label` and `value` so need
    //  to make a custom one.
    // The schema.oneOf is there FOR SURE but TS does not know that
    const options: CustomEnumProps[] = useMemo(
        () =>
            schema.oneOf?.map((datum) => {
                return {
                    label: datum.title ?? '',
                    value: datum.const ?? '',
                    description: datum.description ?? '',
                };
            }) || [],
        [schema.oneOf]
    );

    return (
        <MuiAutocomplete
            {...props}
            isValid={errors.length === 0}
            options={options}
            renderOption={(renderOptionProps, option: CustomEnumProps) => {
                return (
                    <li {...renderOptionProps}>
                        <Stack component="span" spacing={1}>
                            <Typography
                                component="span"
                                style={{ fontWeight: 500 }}
                            >
                                {option.label}
                            </Typography>
                            {option.description.length > 0 ? (
                                <Typography
                                    component="span"
                                    sx={{
                                        pl: 1.5,
                                    }}
                                >
                                    {option.description}
                                </Typography>
                            ) : null}
                        </Stack>
                    </li>
                );
            }}
        />
    );
};

export const materialOneOfEnumControlTester_Descriptions: RankedTester =
    rankWith(
        999,
        and(isOneOfEnumControl, optionIs(ONE_OF_WITH_DESCRIPTIONS, true))
    );

export default withJsonFormsOneOfEnumProps(
    withTranslateProps(React.memo(MaterialEnumControlWith_Description)),
    false
);
