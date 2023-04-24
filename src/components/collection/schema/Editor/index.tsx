import { Grid } from '@mui/material';
import KeyAutoComplete from 'components/schema/KeyAutoComplete';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import AlertBox from 'components/shared/AlertBox';
import useFlowInfer from 'hooks/useFlowInfer';
import useCatalogDetails from './useCatalogDetails';

export interface Props {
    disabled?: boolean;
    entityName?: string;
}

function CollectionSchemaEditor({ disabled, entityName }: Props) {
    const { onChange, catalogSpec, catalogType, draftSpec, isValidating } =
        useCatalogDetails(entityName);

    const inferredSchema = useFlowInfer(draftSpec?.spec.schema);

    console.log('unused vars', {
        onChange,
        disabled,
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

    if (draftSpec && inferredSchema.data.length > 0) {
        return (
            <Grid container>
                <KeyAutoComplete
                    value={draftSpec.spec.key}
                    inferredSchema={inferredSchema.data}
                    // onChange={async (event, value, reason) => {
                    //     console.log('123event>>>>>>>>>', {
                    //         event,
                    //         value,
                    //         reason,
                    //     });
                    //     draftSpec.spec.key = value;
                    //     await onChange(draftSpec.spec);
                    // }}
                />
                <PropertiesViewer inferredSchema={inferredSchema.data} />
            </Grid>
        );
    } else if (isValidating) {
        return <>This is the collection schema skeleton</>;
    } else {
        return null;
    }
}

export default CollectionSchemaEditor;
