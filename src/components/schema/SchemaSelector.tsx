import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import AutocompletedField from 'src/components/shared/toolbar/AutocompletedField';

const options = [
    {
        description: 'Schema at materialization time',
        label: 'Read Schema',
        val: 'read',
    },
    {
        description: 'Schema at capture time',
        label: 'Write Schema',
        val: 'flow://write-schema', // or flow://relaxed-write-schema
    },
    {
        description: 'Schema controlled by flow',
        label: 'Inferred Schema',
        val: 'flow://inferred-schema',
    },
    {
        description: 'Schema controlled by connector',
        label: 'Connector Schema',
        val: 'flow://connector-schema',
    },
];

function SchemaSelector() {
    const intl = useIntl();

    const [hasReadAndWriteSchema, schemaScope, setSchemaScope] =
        useBindingsEditorStore((state) => {
            return [
                state.hasReadAndWriteSchema,
                state.schemaScope,
                state.setSchemaScope,
            ];
        });

    const isOptionEqualToValue = (option: any) =>
        Boolean(option.val === schemaScope);

    if (hasReadAndWriteSchema) {
        return (
            <AutocompletedField
                label={intl.formatMessage({ id: 'schemaEditor.fields.label' })}
                options={options}
                defaultValue={schemaScope}
                changeHandler={(_event, option: any) => {
                    setSchemaScope(option.val);
                }}
                autocompleteSx={{ minWidth: 200 }}
                AutoCompleteOptions={{
                    isOptionEqualToValue,
                    renderOption: (
                        renderOptionProps,
                        { label, description }: any
                    ) => {
                        return (
                            <li {...renderOptionProps}>
                                <Stack
                                    component="span"
                                    spacing={1}
                                    sx={{ pb: 1 }}
                                >
                                    <Typography
                                        component="span"
                                        style={{ fontWeight: 500 }}
                                    >
                                        {label}
                                    </Typography>

                                    <Typography
                                        component="span"
                                        sx={{
                                            pl: 1.5,
                                        }}
                                    >
                                        {description}
                                    </Typography>
                                </Stack>
                            </li>
                        );
                    },
                    value: schemaScope,
                }}
            />
        );
    }

    return <div />;
}

export default SchemaSelector;
