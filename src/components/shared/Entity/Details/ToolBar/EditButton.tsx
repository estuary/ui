import type { ButtonProps } from '@mui/material';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import { useEditorStore_specs } from 'src/components/editor/Store/hooks';
import EditLink from 'src/components/shared/Entity/EditLink';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

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
