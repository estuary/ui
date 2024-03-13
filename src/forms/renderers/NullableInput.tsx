import { RankedTester, rankWith } from '@jsonforms/core';
import {
    MaterialInputControl,
    MuiInputInteger,
    MuiInputNumber,
    MuiInputText,
} from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { useMemo } from 'react';
import { AllowedNullable } from 'services/jsonforms/shared';
import { Options } from 'types/jsonforms';
import { optionExists } from './Overrides/testers/testers';

export const nullableControlTester: RankedTester = rankWith(
    1000,
    optionExists(Options.nullable)
);

// This is blank on purpose. For right now we can just show null settings are nothing
const NullableRenderer = (props: any) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { uischema } = props;
    const { options } = uischema;

    const InputComponent = useMemo(() => {
        const providerVal: AllowedNullable = options
            ? options[Options.nullable]
            : null;

        switch (providerVal) {
            case 'array':
                return null;
            case 'number':
                return MuiInputNumber;
            case 'integer':
                return MuiInputInteger;
            default:
                return MuiInputText;
        }
    }, [options]);

    if (InputComponent === null) {
        // return <MaterialArrayControlRenderer {...props} />;
        return (
            <>
                Need to get Arrays rendering correctly. Probably need two
                different nullable renderers
            </>
        );
    }

    return <MaterialInputControl {...props} input={InputComponent} />;
};

export const NullableControl = withJsonFormsControlProps(NullableRenderer);
