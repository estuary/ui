import { useMemo } from 'react';

import { RankedTester, rankWith } from '@jsonforms/core';
import { Unwrapped } from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { optionExists } from '../Overrides/testers/testers';
import { nullableRank } from './shared';

import { AllowedNullable } from 'src/services/jsonforms/shared';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { Options } from 'src/types/jsonforms';

const { MaterialNumberControl, MaterialIntegerControl, MaterialTextControl } =
    Unwrapped;

export const nullableControlTester: RankedTester = rankWith(
    nullableRank,
    optionExists(Options.nullable)
);

const NullableControlRenderer = (props: any) => {
    const { uischema } = props;
    const { options } = uischema;

    const InputComponent = useMemo(() => {
        const nullableType: AllowedNullable = options
            ? options[Options.nullable]
            : null;

        switch (nullableType) {
            case 'string':
                return MaterialTextControl;
            case 'number':
                return MaterialNumberControl;
            case 'integer':
                return MaterialIntegerControl;
            default:
                logRocketEvent(CustomEvents.JSON_FORMS_NULLABLE_UNSUPPORTED, {
                    nullableType,
                });
                return null;
        }
    }, [options]);

    if (InputComponent === null) {
        return null;
    }

    return <InputComponent {...props} />;
};

export const NullableControl = withJsonFormsControlProps(
    NullableControlRenderer
);
