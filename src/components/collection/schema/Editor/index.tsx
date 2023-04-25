import { Grid } from '@mui/material';
import { useBindingsEditorStore_editModeEnabled } from 'components/editor/Bindings/Store/hooks';
import KeyAutoComplete from 'components/schema/KeyAutoComplete';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import { OnChange } from 'components/schema/types';
import AlertBox from 'components/shared/AlertBox';
import useFlowInfer from 'hooks/useFlowInfer';
import useCatalogDetails from './useCatalogDetails';

export interface Props {
    entityName?: string;
}

function CollectionSchemaEditor({ entityName }: Props) {
    const { onChange, catalogSpec, catalogType, draftSpec, isValidating } =
        useCatalogDetails(entityName);

    console.log('unused vars', {
        catalogSpec,
    });

    const inferredSchema = useFlowInfer(draftSpec?.spec.schema);

    const editModeEnabled = useBindingsEditorStore_editModeEnabled();

    const keyFieldChange: OnChange = async (event, value, reason) => {
        console.log('Changing key for collection', {
            event,
            value,
            reason,
        });
        if (draftSpec?.spec?.key) {
            draftSpec.spec.key = value;
            await onChange(draftSpec.spec);
        } else {
            console.error('Unable to update spec key due to missing spec');
        }
    };

    if (inferredSchema.error) {
        return (
            <AlertBox short severity="error">
                {inferredSchema.error}
            </AlertBox>
        );
    }

    if (isValidating) {
        return <>This is the collection schema skeleton</>;
    } else if (
        draftSpec &&
        catalogType &&
        entityName &&
        inferredSchema.data.length > 0
    ) {
        return (
            <Grid container>
                <KeyAutoComplete
                    value={draftSpec.spec.key}
                    inferredSchema={inferredSchema.data}
                    disabled={!editModeEnabled}
                    onChange={keyFieldChange}
                />
                <PropertiesViewer
                    inferredSchema={inferredSchema.data}
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
