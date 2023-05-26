import { Grid } from '@mui/material';
import { DataPreview } from 'components/collection/DataPreview';
import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { specContainsDerivation } from 'utils/misc-utils';
import ShardInformation from '../Shard/Information';
import Endpoints from './Endpoints';

// TODO (details page)
// Temporary - allow to pass in the name
interface Props {
    name?: string;
}

function Overview({ name }: Props) {
    const entityType = useEntityType();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const isCollection = entityType === 'collection';

    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });
    const catalogSpec = currentCatalog?.spec ?? null;
    const { isDerivation } = specContainsDerivation(catalogSpec);

    const entityName = name ?? catalogName;

    return (
        <Grid container spacing={2}>
            <Endpoints name={entityName} />

            {!isCollection || isDerivation ? (
                <Grid item xs={12}>
                    <ShardInformation entityType={entityType} />
                </Grid>
            ) : null}

            {isCollection && entityName ? (
                <Grid item xs={12}>
                    <DataPreview collectionName={entityName} />
                </Grid>
            ) : null}
        </Grid>
    );
}

export default Overview;
