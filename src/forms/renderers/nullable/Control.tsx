import { RankedTester, rankWith } from '@jsonforms/core';
import { Unwrapped } from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { useMemo } from 'react';
import { AllowedNullable } from 'services/jsonforms/shared';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { Options } from 'types/jsonforms';
import { optionExists } from '../Overrides/testers/testers';
import { nullableRank } from './shared';

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
                logRocketEvent(CustomEvents.JSON_FORMS_NULLABLE_UNSOPPORTED, {
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
