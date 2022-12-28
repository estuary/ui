import {
    and,
    findUISchema,
    isObjectControl,
    JsonSchema7,
    RankedTester,
    rankWith,
    resolveSchema,
    schemaMatches,
    StatePropsOfControlWithDetail,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsDetailProps } from '@jsonforms/react';
import { Alert, Hidden } from '@mui/material';

export const mapTypeTester: RankedTester = rankWith(
    999,
    and(
        isObjectControl,
        schemaMatches((schema) => {
            return (
                typeof schema.additionalProperties === 'object' ||
                typeof schema.patternProperties === 'object'
            );
        })
    )
);

// Map types are defined as schemas with (additional|pattern)Properties of a specific type.
// NOTE: We only support patternProperties with a single pattern, for the moment
// TODO (js): Everything about the way this is written is inefficient and sloppy, clean it up and make it nice
const MapTypeRenderer = (props: StatePropsOfControlWithDetail) => {
    const {
        visible,
        path,
        schema,
        rootSchema,
        enabled,
        uischemas,
        uischema,
        renderers,
        cells,
    } = props;
    const isPattern = schema.patternProperties !== undefined;

    if (
        schema.patternProperties &&
        Object.keys(schema.patternProperties).length !== 1
    ) {
        return (
            <Hidden xsUp={!visible}>
                <Alert severity="error">
                    <code>/{path}: patternProperties</code> must define a single
                    pattern
                </Alert>
            </Hidden>
        );
    }
    const keyPattern = schema.patternProperties
        ? Object.keys(schema.patternProperties)[0]
        : '.*';

    let valueSchema = schema.patternProperties
        ? schema.patternProperties[keyPattern]
        : schema.additionalProperties;

    if (typeof valueSchema !== 'object') {
        return (
            <Hidden xsUp={!visible}>
                <Alert severity="error">
                    <code>
                        /{path}:{' '}
                        {isPattern
                            ? 'patternProperties'
                            : 'additionalProperties'}{' '}
                    </code>{' '}
                    must define a schema.
                </Alert>
            </Hidden>
        );
    }

    if (valueSchema.$ref !== undefined) {
        valueSchema = resolveSchema(rootSchema, valueSchema.$ref, rootSchema);
    }

    const arraySchema: JsonSchema7 = {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                key: {
                    type: 'string',
                    pattern: keyPattern,
                },
                value: valueSchema as JsonSchema7,
            },
        },
    };

    const arrayUiSchema = findUISchema(
        uischemas ?? [],
        arraySchema,
        uischema.scope,
        path,
        'Group',
        uischema,
        rootSchema
    );

    return (
        <Hidden xsUp={!visible}>
            <JsonFormsDispatch
                visible={visible}
                enabled={enabled}
                schema={arraySchema}
                uischema={arrayUiSchema}
                path={path}
                renderers={renderers}
                cells={cells}
            />
        </Hidden>
    );
};

export const MapType = withJsonFormsDetailProps(MapTypeRenderer);
