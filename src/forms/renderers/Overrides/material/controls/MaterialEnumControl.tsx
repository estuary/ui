import type {
    ControlProps,
    EnumOption,
    OwnPropsOfEnum,
    RankedTester,
} from '@jsonforms/core';
import type { WithOptionLabel } from '@jsonforms/material-renderers';
import type { TranslateProps } from '@jsonforms/react';

import React from 'react';

import { Stack, Typography } from '@mui/material';

import { and, isOneOfEnumControl, rankWith } from '@jsonforms/core';
import { MaterialEnumControl } from '@jsonforms/material-renderers';
import {
    withJsonFormsOneOfEnumProps,
    withTranslateProps,
} from '@jsonforms/react';

import { optionExists } from 'src/forms/renderers/Overrides/testers/testers';
import { Options } from 'src/types/jsonforms';

interface CustomEnumProps extends EnumOption {
    description: string;
}

const MaterialEnumControlWith_Description = (
    props: ControlProps & OwnPropsOfEnum & WithOptionLabel & TranslateProps
) => {
    const { path, handleChange, schema } = props;

    // the options by default only provide a `label` and `value` so need
    //  to make a custom one.
    // The schema.oneOf is there FOR SURE but TS does not know that
    const options: CustomEnumProps[] =
        schema.oneOf?.map((datum) => {
            return {
                label: datum.title ?? '',
                value: datum.const ?? '',
                description: datum.description ?? '',
            };
        }) || [];

    // Custom render function for options
    const renderOption: WithOptionLabel['renderOption'] = (
        renderOptionProps,
        option: CustomEnumProps
    ) => {
        return (
            <li {...renderOptionProps}>
                <Stack component="span" spacing={1}>
                    <Typography component="span" style={{ fontWeight: 500 }}>
                        {option.label}
                    </Typography>

                    <Typography
                        component="span"
                        sx={{
                            pl: 1.5,
                        }}
                    >
                        {option.description}
                    </Typography>
                </Stack>
            </li>
        );
    };

    return (
        <MaterialEnumControl
            {...props}
            {...({ renderOption } as any)} // This is ANNOYING - this prop is THERE
            options={options}
            handleChange={(_p: any, value: any) => {
                console.log('handleChange', value);
                handleChange(path, value);
            }}
        />
    );
};

export const materialOneOfEnumControlTester_Descriptions: RankedTester =
    rankWith(
        999,
        and(isOneOfEnumControl, optionExists(Options.enumWithDescriptions))
    );

export default withJsonFormsOneOfEnumProps(
    withTranslateProps(React.memo(MaterialEnumControlWith_Description)),
    false
);
