import { Grid } from '@mui/material';
import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_inferSchemaError,
    useBindingsEditorStore_inferSchemaResponse,
    useBindingsEditorStore_populateInferSchemaResponse,
} from 'components/editor/Bindings/Store/hooks';
import { useEditorStore_setCurrentCatalog } from 'components/editor/Store/hooks';
import KeyAutoComplete from 'components/schema/KeyAutoComplete';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import AlertBox from 'components/shared/AlertBox';
import { useEffect, useState } from 'react';
import { Schema } from 'types';
import useCatalogDetails from './useCatalogDetails';

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
    const { onChange, catalogType, draftSpec } = useCatalogDetails(entityName);

    const [editorSchemaScope, setEditorSchemaScope] = useState<
        string | undefined
    >(undefined);

    const inferSchemaResponse = useBindingsEditorStore_inferSchemaResponse();
    const inferSchemaError = useBindingsEditorStore_inferSchemaError();
    const populateInferSchemaResponse =
        useBindingsEditorStore_populateInferSchemaResponse();
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();

    const setCurrentCatalog = useEditorStore_setCurrentCatalog({
        localScope: true,
    });

    const keyFieldChange = async (_event: any, value: string[]) => {
        if (draftSpec?.spec?.key) {
            draftSpec.spec.key = value;
            await onChange(draftSpec.spec);
        } else {
            console.error('Unable to update spec key due to missing spec');
        }
    };

    const schemaChange = async (_event: any, value: Schema) => {
        if (editorSchemaScope && draftSpec?.spec) {
            draftSpec.spec[editorSchemaScope] = value[editorSchemaScope];
            await onChange(draftSpec.spec);
        } else {
            console.error(
                'Unable to update schema due to missing spec or scope'
            );
        }
    };

    useEffect(() => {
        if (draftSpec) {
            const schemaScope = getProperSchemaScope(draftSpec.spec);

            setEditorSchemaScope(schemaScope);
            setCurrentCatalog(draftSpec);
            populateInferSchemaResponse(draftSpec.spec[schemaScope]);
        }
    }, [draftSpec, populateInferSchemaResponse, setCurrentCatalog]);

    if (inferSchemaError) {
        return (
            <AlertBox short severity="error">
                {inferSchemaError}
            </AlertBox>
        );
    }

    if (
        draftSpec &&
        catalogType &&
        entityName &&
        inferSchemaResponse &&
        inferSchemaResponse.length > 0
    ) {
        return (
            <Grid container>
                <KeyAutoComplete
                    value={draftSpec.spec.key}
                    inferSchemaResponse={inferSchemaResponse}
                    disabled={!editModeEnabled}
                    onChange={keyFieldChange}
                />
                <PropertiesViewer
                    inferSchemaResponse={inferSchemaResponse}
                    disabled={!editModeEnabled}
                    editorProps={{
                        onChange: async (newVal, path, specType) => {
                            console.log('editor chang', {
                                newVal,
                                path,
                                specType,
                            });
                            await schemaChange(null, newVal);
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
