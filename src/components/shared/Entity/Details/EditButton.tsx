import { useEditorStore_specs } from 'components/editor/Store/hooks';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { LiveSpecsQuery_spec } from 'hooks/useLiveSpecs';
import EditLink from '../EditLink';

function EditButton() {
    const spec = useEditorStore_specs<LiveSpecsQuery_spec>({
        localScope: true,
    });
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    if (!spec?.[0].id) {
        return null;
    }

    return (
        <EditLink
            liveSpecId={spec[0].id}
            name={catalogName}
            variant="contained"
        />
    );
}

export default EditButton;
