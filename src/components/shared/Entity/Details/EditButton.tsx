import { Skeleton } from '@mui/material';
import { useEditorStore_specs } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { LiveSpecsQuery_spec } from 'hooks/useLiveSpecs';
import EditLink from '../Shard/EditLink';

function EditButton() {
    const entityType = useEntityType();
    const spec = useEditorStore_specs<LiveSpecsQuery_spec>({
        localScope: true,
    });
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    if (!spec?.[0].id) {
        return <Skeleton />;
    }

    return (
        <EditLink
            liveSpecId={spec[0].id}
            name={catalogName}
            pathPrefix={entityType}
        />
    );
}

export default EditButton;
