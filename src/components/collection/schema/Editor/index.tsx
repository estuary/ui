import { Grid } from '@mui/material';
import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_inferSchemaError,
    useBindingsEditorStore_inferSchemaResponse,
    useBindingsEditorStore_populateInferSchemaResponse,
} from 'components/editor/Bindings/Store/hooks';
import KeyAutoComplete from 'components/schema/KeyAutoComplete';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import AlertBox from 'components/shared/AlertBox';
import { useEffect } from 'react';
import useCatalogDetails from './useCatalogDetails';

export interface Props {
    entityName?: string;
}

function CollectionSchemaEditor({ entityName }: Props) {
    const { onChange, catalogType, draftSpec, isValidating } =
        useCatalogDetails(entityName);

    const inferSchemaResponse = useBindingsEditorStore_inferSchemaResponse();
    const inferSchemaError = useBindingsEditorStore_inferSchemaError();
    const populateInferSchemaResponse =
        useBindingsEditorStore_populateInferSchemaResponse();
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();

    const keyFieldChange = async (_event: any, value: string[]) => {
        if (draftSpec?.spec?.key) {
            draftSpec.spec.key = value;
            await onChange(draftSpec.spec);
        } else {
            console.error('Unable to update spec key due to missing spec');
        }
    };

    useEffect(() => {
        if (draftSpec) {
            populateInferSchemaResponse(draftSpec.spec.schema);
        }
    }, [draftSpec, populateInferSchemaResponse]);

    console.log(`inferSchemaResponse = `, inferSchemaResponse);

    if (isValidating) {
        console.log('CollectionSchemaEditor loading');

        return <>This is the collection schema skeleton</>;
    }

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
                    inferredSchema={inferSchemaResponse}
                    disabled={!editModeEnabled}
                    onChange={keyFieldChange}
                />
                <PropertiesViewer
                    inferredSchema={inferSchemaResponse}
                    disabled={!editModeEnabled}
                    entityName={entityName}
                />
            </Grid>
        );
    } else {
        return null;
    }
}

export default CollectionSchemaEditor;
