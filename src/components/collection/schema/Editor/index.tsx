import { Grid } from '@mui/material';
import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_populateInferSchemaResponse,
    useBindingsEditorStore_schemaUpdated,
} from 'components/editor/Bindings/Store/hooks';
import KeyAutoComplete from 'components/schema/KeyAutoComplete';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import useDraftSpecEditor from 'hooks/useDraftSpecEditor';
import { useEffect, useState } from 'react';
import { useUpdateEffect } from 'react-use';
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
    const { onChange, draftSpec, mutate } = useDraftSpecEditor(
        entityName,
        'collection',
        true
    );

    const [editorSchemaScope, setEditorSchemaScope] = useState<
        string | undefined
    >(undefined);

    // We need to know the schema was updated so we can "reload" this section
    const schemaUpdated = useBindingsEditorStore_schemaUpdated();

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

    useUpdateEffect(() => {
        // If the schema is updated via the scheme inferrence
        //  of CLI button we want to fire mutate and make sure we get the latest
        if (schemaUpdated) {
            void mutate();
        }
    }, [schemaUpdated]);

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
