import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';

function SchemaSelector() {
    const [hasReadAndWriteSchema, schemaScope, setSchemaScope] =
        useBindingsEditorStore((state) => {
            return [
                state.hasReadAndWriteSchema,
                state.schemaScope,
                state.setSchemaScope,
            ];
        });

    if (hasReadAndWriteSchema) {
        return (
            <ToggleButtonGroup
                color="primary"
                size="small"
                exclusive
                onChange={(_event, value) => {
                    console.log('value', value);
                    setSchemaScope(value);
                }}
                value={schemaScope}
            >
                <ToggleButton value="read">Read Schema</ToggleButton>
                <ToggleButton value="write">Write Schema</ToggleButton>
            </ToggleButtonGroup>
        );
    }

    return <div />;
}

export default SchemaSelector;
