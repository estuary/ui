import { Typography } from '@mui/material';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useWorkflowStore_connectorMetadataProperty } from 'src/stores/Workflow/hooks';

export const ExpressHeaderText = () => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const connectorTitle = useWorkflowStore_connectorMetadataProperty(
        connectorId,
        'title'
    );

    return <Typography variant="h6">{connectorTitle}</Typography>;
};
