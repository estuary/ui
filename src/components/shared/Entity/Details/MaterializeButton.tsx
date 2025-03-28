import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import { useEditorStore_specs } from 'src/components/editor/Store/hooks';
import MaterializeLink from 'src/components/shared/Entity/MaterializeLink';
import { useEntityType } from 'src/context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

function MaterializeButton() {
    const entityType = useEntityType();

    const spec = useEditorStore_specs<LiveSpecsQuery_details>({
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
