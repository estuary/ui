import { Grid } from '@mui/material';
import { useBindingsEditorStore_editModeEnabled } from 'components/editor/Bindings/Store/hooks';
import DraftSpecEditor from 'components/editor/DraftSpec';
import KeyAutoComplete from 'components/schema/KeyAutoComplete';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import { OnChange } from 'components/schema/types';
import AlertBox from 'components/shared/AlertBox';
import useFlowInfer from 'hooks/useFlowInfer';
import useCatalogDetails from './useCatalogDetails';

export interface Props {
    entityName?: string;
}

const EDITOR_HEIGHT = 404;

function CollectionSchemaEditor({ entityName }: Props) {
    const { onChange, catalogSpec, catalogType, draftSpec, isValidating } =
        useCatalogDetails(entityName);

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

    console.log('unused vars', {
        onChange,
        catalogSpec,
        catalogType,
    });

    if (inferredSchema.error) {
        return (
            <AlertBox short severity="error">
                {inferredSchema.error}
            </AlertBox>
        );
    }

    if (draftSpec && catalogType && inferredSchema.data.length > 0) {
        return (
            <Grid container>
                <KeyAutoComplete
                    value={draftSpec.spec.key}
                    inferredSchema={inferredSchema.data}
                    disabled={!editModeEnabled}
                    onChange={keyFieldChange}
                />
                {editModeEnabled ? (
                    <DraftSpecEditor
                        entityType={catalogType}
                        localZustandScope={true}
                        editorHeight={EDITOR_HEIGHT}
                        entityName={entityName}
                    />
                ) : (
                    <PropertiesViewer inferredSchema={inferredSchema.data} />
                )}
            </Grid>
        );
    } else if (isValidating) {
        return <>This is the collection schema skeleton</>;
    } else {
        return null;
    }
}

export default CollectionSchemaEditor;
