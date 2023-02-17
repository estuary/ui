import { Grid } from '@mui/material';
import { DataPreview } from 'components/collection/DataPreview';
import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import ShardInformation from '../Shard/Information';

function Overview() {
    const entityType = useEntityType();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const isCollection = entityType === 'collection';

    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });
    const catalogSpec = currentCatalog?.spec ?? null;
    const isDerivation = Boolean(catalogSpec?.derivation);

    return (
        <Grid container spacing={2}>
            {!isCollection || isDerivation ? (
                <Grid item xs={12}>
                    <ShardInformation entityType={entityType} />
                </Grid>
            ) : null}

            {isCollection && catalogName ? (
                <Grid item xs={12}>
                    <DataPreview collectionName={catalogName} />
                </Grid>
            ) : null}
        </Grid>
    );
}

export default Overview;
