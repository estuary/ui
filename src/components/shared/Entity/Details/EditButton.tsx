import { ButtonProps } from '@mui/material';

import EditLink from '../EditLink';

import { useEditorStore_specs } from 'src/components/editor/Store/hooks';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

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
