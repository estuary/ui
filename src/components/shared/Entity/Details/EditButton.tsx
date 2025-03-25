import type { ButtonProps } from '@mui/material';
import type { LiveSpecsQuery_details } from 'hooks/useLiveSpecs';
import { useEditorStore_specs } from 'components/editor/Store/hooks';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import EditLink from '../EditLink';

interface Props {
    buttonVariant?: ButtonProps['variant'];
}

function EditButton({ buttonVariant }: Props) {
    const spec = useEditorStore_specs<LiveSpecsQuery_details>({
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
            variant={buttonVariant ?? 'contained'}
        />
    );
}

export default EditButton;
