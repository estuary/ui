import type { CollectionSchemaEditorProps } from 'src/components/collection/schema/Editor/types';
import type { AllowedScopes } from 'src/components/editor/MonacoEditor/types';
import type { Schema } from 'src/types';

import { useCallback, useEffect, useState } from 'react';

import { Grid, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useUpdateEffect } from 'react-use';

import SchemaWarning from 'src/components/collection/schema/Editor/SchemaWarning';
import CollectionSchemaEditorSkeleton from 'src/components/collection/schema/Editor/Skeleton';
import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_inferSchemaResponseDoneProcessing,
    useBindingsEditorStore_populateInferSchemaResponse,
    useBindingsEditorStore_schemaUpdated,
    useBindingsEditorStore_setCollectionData,
} from 'src/components/editor/Bindings/Store/hooks';
import KeyAutoComplete from 'src/components/schema/KeyAutoComplete';
import PropertiesViewer from 'src/components/schema/PropertiesViewer';
import { useEntityType } from 'src/context/EntityContext';
import { useProjectionsForSkim } from 'src/hooks/projections/useProjectionsForSkim';
import useDisableSchemaEditing from 'src/hooks/useDisableSchemaEditing';
import useDraftSpecEditor from 'src/hooks/useDraftSpecEditor';
import { getProperSchemaScope } from 'src/utils/schema-utils';

function CollectionSchemaEditor({
    entityName,
    localZustandScope,
}: CollectionSchemaEditorProps) {
    const [editorSchemaScope, setEditorSchemaScope] = useState<
        AllowedScopes | undefined
    >(undefined);

    const { onChange, draftSpec, mutate, defaultValue } = useDraftSpecEditor(
        entityName,
        localZustandScope,
        editorSchemaScope
    );

    const projections = useProjectionsForSkim();

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
    const disableSchemaEditing = useDisableSchemaEditing();

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

            // TODO (skim) need to replace draft spec with live spec when editing
            populateInferSchemaResponse(
                draftSpec.spec,
                entityName,
                draftSpec.spec,
                projections
            );

            // Need to keep the collection data updated so that the schema
            //  inference and CLI buttons work
            setCollectionData({ spec: draftSpec.spec, belongsToDraft: true });
        }
    }, [
        draftSpec?.spec,
        entityType,
        entityName,
        populateInferSchemaResponse,
        projections,
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
            <Grid container rowGap={2}>
                {entityType === 'collection' ? null : (
                    <Grid item xs={12}>
                        <Stack
                            sx={{
                                alignItems: 'start',
                                alignContent: 'start',
                            }}
                        >
                            <Typography variant="subtitle1" component="div">
                                <FormattedMessage id="entityName.label" />
                            </Typography>

                            <Typography sx={{ ml: 1.5 }}>
                                {entityName}
                            </Typography>
                        </Stack>
                    </Grid>
                )}

                <SchemaWarning />

                <KeyAutoComplete
                    value={draftSpec.spec.key}
                    disabled={!editModeEnabled || disableSchemaEditing}
                    onChange={onKeyChange}
                />
                <PropertiesViewer
                    disabled={!editModeEnabled || disableSchemaEditing}
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
