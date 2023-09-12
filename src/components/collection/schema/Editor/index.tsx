import { Grid, Stack, Typography } from '@mui/material';
import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_populateInferSchemaResponse,
    useBindingsEditorStore_schemaUpdated,
    useBindingsEditorStore_setCollectionData,
} from 'components/editor/Bindings/Store/hooks';
import { AllowedScopes } from 'components/editor/MonacoEditor/types';
import KeyAutoComplete from 'components/schema/KeyAutoComplete';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import { useEntityType } from 'context/EntityContext';
import useDraftSpecEditor from 'hooks/useDraftSpecEditor';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useUpdateEffect } from 'react-use';
import { Schema } from 'types';
import { getProperSchemaScope } from 'utils/schema-utils';

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

    const setCollectionData = useBindingsEditorStore_setCollectionData();

    const populateInferSchemaResponse =
        useBindingsEditorStore_populateInferSchemaResponse();
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();

    useEffect(() => {
        if (draftSpec && entityName) {
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
        draftSpec,
        entityType,
        entityName,
        populateInferSchemaResponse,
        setCollectionData,
    ]);

    useUpdateEffect(() => {
        // If the schema is updated via the scheme inference
        //  of CLI button we want to fire mutate and make sure we get the latest
        if (mutate && schemaUpdated) {
            void mutate();
        }
    }, [schemaUpdated]);

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
