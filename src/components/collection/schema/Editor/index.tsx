import { Grid, Stack, Typography } from '@mui/material';
import { useBindingsEditorStore } from 'components/editor/Bindings/Store/create';
import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_inferSchemaResponseDoneProcessing,
    useBindingsEditorStore_populateInferSchemaResponse,
    useBindingsEditorStore_schemaUpdated,
    useBindingsEditorStore_setCollectionData,
} from 'components/editor/Bindings/Store/hooks';
import type { AllowedScopes } from 'components/editor/MonacoEditor/types';
import KeyAutoComplete from 'components/schema/KeyAutoComplete';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import { useEntityType } from 'context/EntityContext';
import useDraftSpecEditor from 'hooks/useDraftSpecEditor';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useUpdateEffect } from 'react-use';
import type { Schema } from 'types';
import { getProperSchemaScope } from 'utils/schema-utils';
import CollectionSchemaEditorSkeleton from './Skeleton';

export interface Props {
    entityName?: string;
    localZustandScope?: boolean;
}

function CollectionSchemaEditor({ entityName, localZustandScope }: Props) {
    const [editorSchemaScope, setEditorSchemaScope] = useState<
        AllowedScopes | undefined
    >(undefined);

    const { onChange, draftSpec, mutate, defaultValue } = useDraftSpecEditor(
        entityName,
        localZustandScope,
        editorSchemaScope
    );

    const entityType = useEntityType();

    // We need to know the schema was updated so we can "reload" this section
    const schemaUpdated = useBindingsEditorStore_schemaUpdated();
    const collectionInitializationDone = useBindingsEditorStore(
        (state) => state.collectionInitializationDone
    );

    const setCollectionData = useBindingsEditorStore_setCollectionData();

    const inferSchemaResponseDoneProcessing =
        useBindingsEditorStore_inferSchemaResponseDoneProcessing();
    const populateInferSchemaResponse =
        useBindingsEditorStore_populateInferSchemaResponse();
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();

    useEffect(() => {
        if (draftSpec?.spec && entityName) {
            // TODO (collection editor) when we allow collections to get updated
            //  from the details page we'll need to handle this for that.

            // Figure out if we need to use schema or readSchema
            const [schemaScope] = getProperSchemaScope(draftSpec.spec);

            // Store off what scope is being used
            setEditorSchemaScope(schemaScope);

            // Infer schema and pass in spec so the function can handle
            //  if there is a read/write or just plain schema
            populateInferSchemaResponse(draftSpec.spec, entityName);

            // Need to keep the collection data updated so that the schema
            //  inference and CLI buttons work
            setCollectionData({ spec: draftSpec.spec, belongsToDraft: true });
        }
    }, [
        draftSpec?.spec,
        entityType,
        entityName,
        populateInferSchemaResponse,
        setCollectionData,
    ]);

    // If the schema is updated via the scheme inference
    //  of CLI button we want to fire mutate and make sure we get the latest
    useUpdateEffect(() => {
        if (mutate && schemaUpdated) {
            void mutate();
        }
    }, [schemaUpdated]);

    // If the collection was initialized we need to fire mutate so that the collection
    //  spec editor can refresh itself and know about the new draft we just created
    //  for the collection
    useUpdateEffect(() => {
        if (mutate && collectionInitializationDone) {
            void mutate();
        }
    }, [mutate, collectionInitializationDone]);

    const onKeyChange = useCallback(
        async (_event, keys) => {
            if (entityName) {
                await onChange(keys, entityName, 'collection', 'key');
            }
        },
        [onChange, entityName]
    );

    const onPropertiesViewerChange = useCallback(
        async (value: Schema, path, type, scope) => {
            await onChange(value, path, type, scope ?? 'schema');
        },
        [onChange]
    );

    if (draftSpec && entityName) {
        if (!inferSchemaResponseDoneProcessing) {
            return <CollectionSchemaEditorSkeleton />;
        }
        return (
            <Grid container>
                {entityType === 'collection' ? null : (
                    <Stack
                        sx={{
                            alignItems: 'start',
                            alignContent: 'start',
                            mb: 3,
                        }}
                    >
                        <Typography variant="subtitle1" component="div">
                            <FormattedMessage id="entityName.label" />
                        </Typography>

                        <Typography sx={{ ml: 1.5 }}>{entityName}</Typography>
                    </Stack>
                )}

                <KeyAutoComplete
                    value={draftSpec.spec.key}
                    disabled={!editModeEnabled}
                    onChange={onKeyChange}
                />
                <PropertiesViewer
                    disabled={!editModeEnabled}
                    editorProps={{
                        localZustandScope,
                        onChange: onPropertiesViewerChange,
                        editorSchemaScope,
                        defaultValue,
                        path: `${entityName}-${editorSchemaScope}`,
                    }}
                />
            </Grid>
        );
    } else {
        return null;
    }
}

export default CollectionSchemaEditor;
