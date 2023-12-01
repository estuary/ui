import { useEditorStore_specs } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { LiveSpecsQuery_spec } from 'hooks/useLiveSpecs';
import MaterializeLink from '../MaterializeLink';

function MaterializeButton() {
    const entityType = useEntityType();

    const spec = useEditorStore_specs<LiveSpecsQuery_spec>({
        localScope: true,
    });
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    if (entityType === 'materialization' || !spec?.[0].id) {
        return null;
    }

    return (
        <MaterializeLink
            liveSpecId={spec[0].id}
            name={catalogName}
            variant="contained"
        />
    );
}

export default MaterializeButton;
