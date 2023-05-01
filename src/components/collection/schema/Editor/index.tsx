import { Grid } from '@mui/material';
import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_populateInferSchemaResponse,
} from 'components/editor/Bindings/Store/hooks';
import KeyAutoComplete from 'components/schema/KeyAutoComplete';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import useDraftSpecEditor from 'hooks/useDraftSpecEditor';
import { useEffect, useState } from 'react';
import { Schema } from 'types';

export interface Props {
    entityName?: string;
}

// TODO (collection editor) need to figure out if we want to
//  test if the user is on materialization or captures
//  and force the user to only update schema when on captures
const getProperSchemaScope = (spec: any) => {
    let key;

    if (spec.readSchema) {
        key = 'readSchema';
    } else {
        key = 'schema';
    }

    return key;
};

function CollectionSchemaEditor({ entityName }: Props) {
    const { onChange, draftSpec } = useDraftSpecEditor(
        entityName,
        'collection',
        true
    );

    const [editorSchemaScope, setEditorSchemaScope] = useState<
        string | undefined
    >(undefined);

    const populateInferSchemaResponse =
        useBindingsEditorStore_populateInferSchemaResponse();
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();

    useEffect(() => {
        if (draftSpec) {
            const schemaScope = getProperSchemaScope(draftSpec.spec);

            setEditorSchemaScope(schemaScope);
            populateInferSchemaResponse(draftSpec.spec[schemaScope]);
        }
    }, [draftSpec, populateInferSchemaResponse]);

    if (draftSpec && entityName) {
        return (
            <Grid container>
                <KeyAutoComplete
                    value={draftSpec.spec.key}
                    disabled={!editModeEnabled}
                    onChange={async (_event, keys) => {
                        await onChange(keys, entityName, 'collection', 'key');
                    }}
                />
                <PropertiesViewer
                    disabled={!editModeEnabled}
                    editorProps={{
                        onChange: async (value: Schema, path, type, scope) => {
                            if (scope) {
                                await onChange(value, path, type, scope);
                            } else {
                                console.error(
                                    'Unable to update schema due to missing scope'
                                );
                            }
                        },
                        editorSchemaScope,
                    }}
                />
            </Grid>
        );
    } else {
        return null;
    }
}

export default CollectionSchemaEditor;
